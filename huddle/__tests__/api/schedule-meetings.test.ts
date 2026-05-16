jest.mock("@/lib/cosmos", () => ({
  employeesContainer: { items: { query: jest.fn() } },
  meetingsContainer: { items: { query: jest.fn(), create: jest.fn() } },
}));
jest.mock("@/lib/carryover", () => ({ carryOverIncompleteItems: jest.fn().mockResolvedValue(undefined) }));

import { POST } from "@/app/api/schedule-meetings/route";
import { employeesContainer, meetingsContainer } from "@/lib/cosmos";
import { carryOverIncompleteItems } from "@/lib/carryover";
import { NextRequest } from "next/server";

const mockEmpQuery = employeesContainer.items.query as jest.Mock;
const mockMtgQuery = meetingsContainer.items.query as jest.Mock;
const mockCreate = meetingsContainer.items.create as jest.Mock;
const mockCarryOver = carryOverIncompleteItems as jest.Mock;

const SECRET = "test-secret";

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

const TODAY = "2026-05-16";

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(`${TODAY}T09:00:00Z`));
});

afterAll(() => jest.useRealTimers());

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

  it("creates a meeting for a weekly employee with no previous meetings", async () => {
    mockEmpQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "e1", cadence: "weekly" }] }),
    });
    mockMtgQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ created: 1, skipped: 0 });
    expect(mockCarryOver).not.toHaveBeenCalled();
  });

  it("creates a meeting and carries over when weekly cadence is due", async () => {
    mockEmpQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "e1", cadence: "weekly" }] }),
    });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-old", meetingDate: "2026-05-09" }] }),
    });
    mockCreate.mockResolvedValue({ resource: { id: "m-new", employeeId: "e1" } });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ created: 1, skipped: 0 });
    expect(mockCarryOver).toHaveBeenCalledWith("m-old", "m-new", "e1");
  });

  it("skips a weekly employee whose last meeting was 3 days ago", async () => {
    mockEmpQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "e1", cadence: "weekly" }] }),
    });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-old", meetingDate: "2026-05-13" }] }),
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ created: 0, skipped: 1 });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("skips a biweekly employee whose last meeting was 10 days ago", async () => {
    mockEmpQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "e1", cadence: "biweekly" }] }),
    });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-old", meetingDate: "2026-05-06" }] }),
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ created: 0, skipped: 1 });
  });

  it("skips an employee who already has a meeting today", async () => {
    mockEmpQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "e1", cadence: "weekly" }] }),
    });
    mockMtgQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m-today", meetingDate: TODAY }] }),
    });

    const res = await POST(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ created: 0, skipped: 1 });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("handles multiple employees correctly", async () => {
    mockEmpQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({
        resources: [
          { id: "e1", cadence: "weekly" },   // due (7 days)
          { id: "e2", cadence: "biweekly" },  // not due (10 days)
          { id: "e3", cadence: "biweekly" },  // due (14 days)
        ],
      }),
    });
    mockMtgQuery
      .mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m1", meetingDate: "2026-05-09" }] }) })
      .mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m2", meetingDate: "2026-05-06" }] }) })
      .mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "m3", meetingDate: "2026-05-02" }] }) });
    mockCreate
      .mockResolvedValueOnce({ resource: { id: "m-new-1", employeeId: "e1" } })
      .mockResolvedValueOnce({ resource: { id: "m-new-3", employeeId: "e3" } });

    const res = await POST(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ created: 2, skipped: 1 });
  });
});
