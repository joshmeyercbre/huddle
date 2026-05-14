import { NextRequest } from "next/server";

jest.mock("@/lib/cosmos", () => ({
  employeesContainer: {
    items: {
      readAll: jest.fn(),
      create: jest.fn(),
    },
    item: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

import { GET, POST } from "@/app/api/employees/route";
import { PUT } from "@/app/api/employees/[id]/route";
import { employeesContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";

const mockRequireAuth = requireAuth as jest.Mock;
const mockReadAll = employeesContainer.items.readAll as jest.Mock;
const mockCreate = employeesContainer.items.create as jest.Mock;
const mockItem = employeesContainer.item as jest.Mock;

function makeRequest(method: string, body?: object, headers?: Record<string, string>): NextRequest {
  return new NextRequest("http://localhost/api/employees", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireAuth.mockReturnValue(null); // authenticated by default
});

describe("GET /api/employees", () => {
  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockReturnValue(Response.json({ error: "Unauthorized" }, { status: 401 }));
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
  });

  it("returns employee list", async () => {
    const employees = [{ id: "1", name: "Alice", token: "tok", cadence: "weekly", createdAt: "2026-01-01" }];
    mockReadAll.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: employees }) });
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(employees);
  });
});

describe("POST /api/employees", () => {
  it("creates an employee and returns 201", async () => {
    const newEmployee = { name: "Bob", cadence: "biweekly" };
    mockCreate.mockResolvedValue({ resource: { id: "gen-id", ...newEmployee, token: "gen-token", createdAt: "2026-01-01" } });
    const res = await POST(makeRequest("POST", newEmployee));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Bob");
    expect(body.token).toBeDefined();
  });
});
