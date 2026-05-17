jest.mock("@/lib/cosmos", () => ({
  employeesContainer: { items: { query: jest.fn() } },
  meetingsContainer: { items: { query: jest.fn(), create: jest.fn() } },
}));
jest.mock("@/lib/carryover", () => ({ carryOverIncompleteItems: jest.fn().mockResolvedValue(undefined) }));
jest.mock("@/lib/notify", () => ({
  sendEmployeeNotification: jest.fn().mockResolvedValue(undefined),
  sendManagerDigest: jest.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/schedule-meetings/route";
import { employeesContainer, meetingsContainer } from "@/lib/cosmos";
import { carryOverIncompleteItems } from "@/lib/carryover";
import { sendEmployeeNotification, sendManagerDigest } from "@/lib/notify";
import { NextRequest } from "next/server";

const mockEmpQuery = employeesContainer.items.query as jest.Mock;
const mockMtgQuery = meetingsContainer.items.query as jest.Mock;
const mockCreate = meetingsContainer.items.create as jest.Mock;
const mockCarryOver = carryOverIncompleteItems as jest.Mock;
const mockNotifyEmp = sendEmployeeNotification as jest.Mock;
const mockDigest = sendManagerDigest as jest.Mock;

const SECRET = "test-secret";
const TODAY = "2026-05-16"; // Saturday

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(`${TODAY}T06:00:00Z`));
});

afterAll(() => jest.useRealTimers());

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SCHEDULE_SECRET = SECRET;
});

function makeRequest() {
  return new NextRequest("http://localhost/api/schedule-meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}` },
  });
}

describe("POST /api/schedule-meetings", () => {
  it("returns 401 when secret is missing", async () => {
    const req = new NextRequest("http://localhost/api/schedule-meetings", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when secret is wrong", async () => {
    const req = new NextRequest("http://localhost/api/schedule-meetings", {
      method: "POST",
      headers: { Authorization: "Bearer wrong" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates a meeting for employee with no prior meetings (notifyDaysBefore=0)", async () => {
    const emp = { id: "e1", cadence: "weekly", notifyDaysBefore: 0 };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [emp] }) });
    mockMtgQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ created: 1, skipped: 0 });
    expect(mockCarryOver).not.toHaveBeenCalled();

    const createdMeeting = mockCreate.mock.calls[0][0];
    expect(createdMeeting.meetingDate).toBe(TODAY);
  });

  it("sets meetingDate to tomorrow when notifyDaysBefore=1", async () => {
    const emp = { id: "e1", cadence: "weekly", notifyDaysBefore: 1 };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [emp] }) });
    mockMtgQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    await POST(makeRequest());
    const createdMeeting = mockCreate.mock.calls[0][0];
    expect(createdMeeting.meetingDate).toBe("2026-05-17");
  });

  it("creates meeting and carries over when weekly cadence is due (notifyDaysBefore=0)", async () => {
    const emp = { id: "e1", cadence: "weekly", notifyDaysBefore: 0 };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [emp] }) });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-old", meetingDate: "2026-05-09" }] }),
    });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    const res = await POST(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ created: 1, skipped: 0 });
    expect(mockCarryOver).toHaveBeenCalledWith("m-old", "m-new", "e1");
  });

  it("creates meeting for notifyDaysBefore=1 when daysSince+1 >= cadence", async () => {
    // today=Saturday May 16, last=Saturday May 9 (7 days ago), notifyDays=1 → meet Sunday May 17
    const emp = { id: "e1", cadence: "weekly", notifyDaysBefore: 1 };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [emp] }) });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-old", meetingDate: "2026-05-09" }] }),
    });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    const res = await POST(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ created: 1, skipped: 0 });
    const createdMeeting = mockCreate.mock.calls[0][0];
    expect(createdMeeting.meetingDate).toBe("2026-05-17");
  });

  it("skips when daysSince + notifyDaysBefore < cadence", async () => {
    // today=Saturday May 16, last=Tuesday May 12 (4 days), notifyDays=1 → 4+1=5 < 7
    const emp = { id: "e1", cadence: "weekly", notifyDaysBefore: 1 };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [emp] }) });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-old", meetingDate: "2026-05-12" }] }),
    });

    const res = await POST(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ created: 0, skipped: 1 });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("skips when meeting already exists on computed meetingDate", async () => {
    const emp = { id: "e1", cadence: "weekly", notifyDaysBefore: 0 };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [emp] }) });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-today", meetingDate: TODAY }] }),
    });

    const res = await POST(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ created: 0, skipped: 1 });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("sends employee notification and manager digest after creating meetings", async () => {
    const emp = { id: "e1", name: "Alice", cadence: "weekly", notifyDaysBefore: 0, email: "a@co.com" };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [emp] }) });
    mockMtgQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    await POST(makeRequest());
    expect(mockNotifyEmp).toHaveBeenCalledWith(emp, TODAY);
    expect(mockDigest).toHaveBeenCalledWith([{ employee: emp, meetingDate: TODAY }]);
  });

  it("sends manager digest even when some employees are skipped", async () => {
    const empDue = { id: "e1", cadence: "weekly", notifyDaysBefore: 0 };
    const empSkip = { id: "e2", cadence: "weekly", notifyDaysBefore: 0 };
    mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [empDue, empSkip] }) });
    mockMtgQuery
      .mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) })
      .mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m2", meetingDate: TODAY }] }) });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    const res = await POST(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ created: 1, skipped: 1 });
    expect(mockDigest).toHaveBeenCalledWith([{ employee: empDue, meetingDate: TODAY }]);
  });
});
