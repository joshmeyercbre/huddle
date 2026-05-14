jest.mock("@/lib/cosmos", () => ({
  employeesContainer: {
    items: { query: jest.fn() },
  },
  meetingsContainer: {
    items: { query: jest.fn() },
  },
  actionItemsContainer: {
    items: { query: jest.fn() },
  },
}));

import { GET } from "@/app/api/1on1/[token]/route";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import { NextRequest } from "next/server";

const mockEmpQuery = employeesContainer.items.query as jest.Mock;
const mockMeetQuery = meetingsContainer.items.query as jest.Mock;
const mockAiQuery = actionItemsContainer.items.query as jest.Mock;

const employee = { id: "e1", name: "Alice", token: "tok-123", cadence: "weekly", createdAt: "2026-01-01" };
const meeting = { id: "m1", employeeId: "e1", meetingDate: "2026-05-14", createdAt: "2026-05-14", sections: { whatsOnYourMind: [], winOfWeek: "", workingOn: "", blockers: "" } };
const actionItems = [{ id: "ai-1", meetingId: "m1", employeeId: "e1", text: "Chase IT", assignee: "manager", completed: false, carriedOver: true, createdAt: "2026-05-14" }];

beforeEach(() => {
  jest.clearAllMocks();
  mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [employee] }) });
  mockMeetQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [meeting] }) });
  mockAiQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: actionItems }) });
});

it("returns employee, current meeting, and action items for a valid token", async () => {
  const req = new NextRequest("http://localhost/api/1on1/tok-123");
  const res = await GET(req, { params: { token: "tok-123" } });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.employee.name).toBe("Alice");
  expect(body.meeting.id).toBe("m1");
  expect(body.actionItems).toHaveLength(1);
});

it("returns 404 for an unknown token", async () => {
  mockEmpQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
  const req = new NextRequest("http://localhost/api/1on1/bad-token");
  const res = await GET(req, { params: { token: "bad-token" } });
  expect(res.status).toBe(404);
});

it("returns employee with null meeting when no meeting exists yet", async () => {
  mockMeetQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
  const req = new NextRequest("http://localhost/api/1on1/tok-123");
  const res = await GET(req, { params: { token: "tok-123" } });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.employee.name).toBe("Alice");
  expect(body.meeting).toBeNull();
  expect(body.actionItems).toHaveLength(0);
});
