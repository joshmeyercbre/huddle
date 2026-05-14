jest.mock("@/lib/cosmos", () => ({
  meetingsContainer: {
    items: {
      query: jest.fn(),
      create: jest.fn(),
    },
    item: jest.fn(),
  },
}));
jest.mock("@/lib/auth", () => ({ requireAuth: jest.fn().mockReturnValue(null) }));
jest.mock("@/lib/carryover", () => ({ carryOverIncompleteItems: jest.fn().mockResolvedValue(undefined) }));

import { POST } from "@/app/api/meetings/route";
import { GET, PUT } from "@/app/api/meetings/[id]/route";
import { meetingsContainer } from "@/lib/cosmos";
import { carryOverIncompleteItems } from "@/lib/carryover";
import { NextRequest } from "next/server";

const mockQuery = meetingsContainer.items.query as jest.Mock;
const mockCreate = meetingsContainer.items.create as jest.Mock;
const mockItem = meetingsContainer.item as jest.Mock;
const mockCarryOver = carryOverIncompleteItems as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("POST /api/meetings", () => {
  it("creates a meeting with empty sections and triggers carryover", async () => {
    const prevMeeting = { id: "prev-id", employeeId: "emp-1" };
    mockQuery.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [prevMeeting] }),
    });
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
    const existing = {
      id: "m1", employeeId: "e1", meetingDate: "2026-05-14", createdAt: "2026-05-14",
      sections: { whatsOnYourMind: [], winOfWeek: "", workingOn: "", blockers: "" }
    };
    const updatedMeeting = { ...existing, sections: { ...existing.sections, winOfWeek: "Shipped the feature" } };
    mockItem.mockReturnValue({
      read: jest.fn().mockResolvedValue({ resource: existing }),
      replace: jest.fn().mockResolvedValue({ resource: updatedMeeting }),
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
  });
});
