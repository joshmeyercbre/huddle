jest.mock("@/lib/cosmos", () => ({
  meetingsContainer: {
    items: { query: jest.fn(), create: jest.fn() },
    item: jest.fn(),
  },
  employeesContainer: { item: jest.fn() },
  actionItemsContainer: { items: { query: jest.fn() } },
}));
jest.mock("@/lib/auth", () => ({ requireAuth: jest.fn().mockReturnValue(null) }));
jest.mock("@/lib/carryover", () => ({ carryOverIncompleteItems: jest.fn().mockResolvedValue(undefined) }));
jest.mock("@/lib/notify", () => ({ sendMeetingSummary: jest.fn().mockResolvedValue(undefined) }));

import { POST } from "@/app/api/meetings/route";
import { GET, PUT } from "@/app/api/meetings/[id]/route";
import { meetingsContainer, employeesContainer, actionItemsContainer } from "@/lib/cosmos";
import { carryOverIncompleteItems } from "@/lib/carryover";
import { sendMeetingSummary } from "@/lib/notify";
import { NextRequest } from "next/server";

const mockQuery = meetingsContainer.items.query as jest.Mock;
const mockCreate = meetingsContainer.items.create as jest.Mock;
const mockItem = meetingsContainer.item as jest.Mock;
const mockEmpItem = employeesContainer.item as jest.Mock;
const mockAiQuery = actionItemsContainer.items.query as jest.Mock;
const mockCarryOver = carryOverIncompleteItems as jest.Mock;
const mockSummary = sendMeetingSummary as jest.Mock;

beforeEach(() => jest.clearAllMocks());

const baseMeeting = {
  id: "m1", employeeId: "e1", meetingDate: "2026-05-14", createdAt: "2026-05-14",
  type: "standard",
  sections: { whatsOnYourMind: [], winOfWeek: "", workingOn: "", blockers: "" },
};

describe("POST /api/meetings", () => {
  it("creates a standard meeting and triggers carryover", async () => {
    const prevMeeting = { id: "prev-id", employeeId: "emp-1" };
    mockQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [prevMeeting] }) });
    const newMeeting = { id: "new-id", employeeId: "emp-1" };
    mockCreate.mockResolvedValue({ resource: newMeeting });

    const req = new NextRequest("http://localhost/api/meetings", {
      method: "POST",
      body: JSON.stringify({ employeeId: "emp-1", meetingDate: "2026-05-14" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockCarryOver).toHaveBeenCalledWith("prev-id", "new-id", "emp-1");
  });

  it("creates a quarterly meeting with quarterly sections", async () => {
    mockQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
    mockCreate.mockResolvedValue({ resource: { id: "new-id", employeeId: "e1", type: "quarterly" } });

    const req = new NextRequest("http://localhost/api/meetings", {
      method: "POST",
      body: JSON.stringify({ employeeId: "e1", meetingDate: "2026-05-14", type: "quarterly" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const created = mockCreate.mock.calls[0][0];
    expect(created.type).toBe("quarterly");
    expect(created.sections).toHaveProperty("winsThisQuarter", "");
    expect(created.sections).toHaveProperty("goalsReview", "");
  });

  it("skips carryover when no previous meeting exists", async () => {
    mockQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
    mockCreate.mockResolvedValue({ resource: { id: "new-id", employeeId: "emp-1" } });

    const req = new NextRequest("http://localhost/api/meetings", {
      method: "POST",
      body: JSON.stringify({ employeeId: "emp-1", meetingDate: "2026-05-14" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockCarryOver).not.toHaveBeenCalled();
  });
});

describe("PUT /api/meetings/[id]", () => {
  it("merges sections and returns updated meeting", async () => {
    const updated = { ...baseMeeting, sections: { ...baseMeeting.sections, winOfWeek: "Shipped the feature" } };
    mockItem.mockReturnValue({
      read: jest.fn().mockResolvedValue({ resource: baseMeeting }),
      replace: jest.fn().mockResolvedValue({ resource: updated }),
    });

    const req = new NextRequest("http://localhost/api/meetings/m1", {
      method: "PUT",
      body: JSON.stringify({ winOfWeek: "Shipped the feature" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req, { params: { id: "m1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sections.winOfWeek).toBe("Shipped the feature");
    expect(mockSummary).not.toHaveBeenCalled();
  });

  it("sets completedAt and sends summary email", async () => {
    const completedMeeting = { ...baseMeeting, completedAt: "2026-05-14T15:00:00Z" };
    mockItem.mockReturnValue({
      read: jest.fn().mockResolvedValue({ resource: baseMeeting }),
      replace: jest.fn().mockResolvedValue({ resource: completedMeeting }),
    });
    mockEmpItem.mockReturnValue({ read: jest.fn().mockResolvedValue({ resource: { id: "e1", name: "Alice" } }) });
    mockAiQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });

    const req = new NextRequest("http://localhost/api/meetings/m1", {
      method: "PUT",
      body: JSON.stringify({ completedAt: "2026-05-14T15:00:00Z" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req, { params: { id: "m1" } });
    expect(res.status).toBe(200);
    expect(mockSummary).toHaveBeenCalledWith(
      expect.objectContaining({ id: "e1" }),
      completedMeeting,
      []
    );
  });

  it("does not send summary if meeting was already completed", async () => {
    const alreadyCompleted = { ...baseMeeting, completedAt: "2026-05-14T12:00:00Z" };
    mockItem.mockReturnValue({
      read: jest.fn().mockResolvedValue({ resource: alreadyCompleted }),
      replace: jest.fn().mockResolvedValue({ resource: alreadyCompleted }),
    });

    const req = new NextRequest("http://localhost/api/meetings/m1", {
      method: "PUT",
      body: JSON.stringify({ completedAt: "2026-05-14T15:00:00Z" }),
      headers: { "Content-Type": "application/json" },
    });

    await PUT(req, { params: { id: "m1" } });
    expect(mockSummary).not.toHaveBeenCalled();
  });
});
