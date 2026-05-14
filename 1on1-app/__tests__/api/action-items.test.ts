jest.mock("@/lib/cosmos", () => ({
  actionItemsContainer: {
    items: { create: jest.fn() },
    item: jest.fn(),
  },
}));
jest.mock("@/lib/auth", () => ({ requireAuth: jest.fn().mockReturnValue(null) }));

import { POST } from "@/app/api/action-items/route";
import { PUT } from "@/app/api/action-items/[id]/route";
import { actionItemsContainer } from "@/lib/cosmos";
import { NextRequest } from "next/server";

const mockCreate = actionItemsContainer.items.create as jest.Mock;
const mockItem = actionItemsContainer.item as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("POST /api/action-items", () => {
  it("creates an action item and returns 201", async () => {
    const payload = { meetingId: "m1", employeeId: "e1", text: "Chase IT", assignee: "manager" };
    const created = { id: "ai-1", ...payload, completed: false, carriedOver: false, createdAt: "2026-01-01" };
    mockCreate.mockResolvedValue({ resource: created });

    const req = new NextRequest("http://localhost/api/action-items", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.text).toBe("Chase IT");
    expect(body.completed).toBe(false);
  });
});

describe("PUT /api/action-items/[id]", () => {
  it("toggles completed status", async () => {
    const existing = { id: "ai-1", meetingId: "m1", employeeId: "e1", text: "Chase IT", assignee: "manager", completed: false, carriedOver: false, createdAt: "2026-01-01" };
    const replaced = { ...existing, completed: true };
    mockItem.mockReturnValue({
      read: jest.fn().mockResolvedValue({ resource: existing }),
      replace: jest.fn().mockResolvedValue({ resource: replaced }),
    });

    const req = new NextRequest("http://localhost/api/action-items/ai-1", {
      method: "PUT",
      body: JSON.stringify({ completed: true }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req, { params: { id: "ai-1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completed).toBe(true);
  });

  it("returns 404 when action item not found", async () => {
    mockItem.mockReturnValue({
      read: jest.fn().mockResolvedValue({ resource: undefined }),
      replace: jest.fn(),
    });

    const req = new NextRequest("http://localhost/api/action-items/missing", {
      method: "PUT",
      body: JSON.stringify({ completed: true }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req, { params: { id: "missing" } });
    expect(res.status).toBe(404);
  });
});
