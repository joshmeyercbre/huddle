# 1-on-1 Meeting App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js web app where a manager runs 1-on-1 meetings with direct reports, each employee accessing their own private agenda via a unique URL.

**Architecture:** Next.js 14 (App Router, TypeScript, Tailwind) deployed to Azure Static Web Apps free tier. API routes run as Azure Functions. Azure Cosmos DB free tier stores employees, meetings, and action items. Manager authenticates via SWA built-in Microsoft login; employees access via UUID token in URL (no login).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, `@azure/cosmos`, Azure Static Web Apps, Azure Cosmos DB for NoSQL

---

## File Map

```
1on1-app/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                         # Root layout, font + metadata
│   │   ├── page.tsx                           # Manager dashboard (server component)
│   │   ├── employee/[id]/
│   │   │   └── page.tsx                       # Employee meeting history (server component)
│   │   ├── 1on1/[token]/
│   │   │   └── page.tsx                       # Employee meeting page (server component + client children)
│   │   └── api/
│   │       ├── employees/
│   │       │   ├── route.ts                   # GET list, POST create employee
│   │       │   └── [id]/route.ts              # PUT update employee
│   │       ├── meetings/
│   │       │   ├── route.ts                   # POST create meeting (triggers carryover)
│   │       │   └── [id]/route.ts              # PUT update meeting sections
│   │       ├── action-items/
│   │       │   ├── route.ts                   # POST create action item
│   │       │   └── [id]/route.ts              # PUT update (toggle complete, edit text)
│   │       └── 1on1/[token]/
│   │           └── route.ts                   # GET employee + current meeting by token (public)
│   ├── components/
│   │   ├── EmployeeCard.tsx                   # Card on dashboard with Start Meeting + copy link
│   │   ├── AddEmployeeForm.tsx                # Inline form to add a new employee
│   │   ├── MeetingAccordion.tsx               # Expandable past meeting on history page
│   │   ├── MeetingEditor.tsx                  # Client root for the employee meeting page
│   │   ├── SectionCard.tsx                    # Textarea section with auto-save
│   │   ├── TopicList.tsx                      # "What's on your mind" bullet list
│   │   └── ActionItemList.tsx                 # Action items checklist with Add form
│   ├── lib/
│   │   ├── cosmos.ts                          # Cosmos DB client + container exports
│   │   └── auth.ts                            # SWA principal parsing + requireAuth helper
│   └── types/
│       └── index.ts                           # Employee, Meeting, ActionItem interfaces
├── __tests__/
│   ├── lib/auth.test.ts
│   ├── lib/carryover.test.ts
│   ├── api/employees.test.ts
│   ├── api/meetings.test.ts
│   ├── api/action-items.test.ts
│   └── api/token.test.ts
├── staticwebapp.config.json                   # SWA auth + route protection
├── .env.local.example
├── jest.config.ts
├── jest.setup.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Task 1: Scaffold the project

**Files:**
- Create: `1on1-app/` (all scaffolded files)

- [ ] **Step 1: Create the Next.js app**

Run from the worktree root (where `Intelligent-Automation-Studio/` lives):
```bash
npx create-next-app@14 1on1-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-experimental-app
```
When prompted "Would you like to use Turbopack?", select **No**.

- [ ] **Step 2: Install dependencies**

```bash
cd 1on1-app
npm install @azure/cosmos
npm install --save-dev jest jest-environment-jsdom @types/jest ts-jest @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Create `jest.config.ts`**

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
};

export default config;
```

- [ ] **Step 4: Create `jest.setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Add test script to `package.json`**

Open `1on1-app/package.json` and add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Create `.env.local.example`**

```
COSMOS_CONNECTION_STRING=AccountEndpoint=https://YOUR_ACCOUNT.documents.azure.com:443/;AccountKey=YOUR_KEY==;
COSMOS_DB_NAME=1on1db
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Copy to `.env.local` and fill in your values before running locally.

- [ ] **Step 7: Delete boilerplate**

Delete `src/app/page.tsx` content (replace in Task 8).
Delete `public/next.svg`, `public/vercel.svg`.
Replace `src/app/globals.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Commit**

```bash
git add 1on1-app/
git commit -m "feat: scaffold 1on1-app project"
```

---

## Task 2: Types and Cosmos DB client

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/cosmos.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```typescript
export interface Employee {
  id: string;
  name: string;
  token: string;
  cadence: "weekly" | "biweekly";
  createdAt: string;
}

export interface MeetingSections {
  whatsOnYourMind: string[];
  winOfWeek: string;
  workingOn: string;
  blockers: string;
}

export interface Meeting {
  id: string;
  employeeId: string;
  meetingDate: string;
  createdAt: string;
  sections: MeetingSections;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  employeeId: string;
  text: string;
  assignee: "manager" | "employee";
  completed: boolean;
  carriedOver: boolean;
  createdAt: string;
}
```

- [ ] **Step 2: Write `src/lib/cosmos.ts`**

```typescript
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
const db = client.database(process.env.COSMOS_DB_NAME ?? "1on1db");

export const employeesContainer = db.container("employees");
export const meetingsContainer = db.container("meetings");
export const actionItemsContainer = db.container("actionItems");
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/lib/cosmos.ts
git commit -m "feat: add types and cosmos client"
```

---

## Task 3: Auth helpers

**Files:**
- Create: `src/lib/auth.ts`
- Create: `__tests__/lib/auth.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/auth.test.ts`:
```typescript
import { getClientPrincipal, requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

function makeRequest(principalJson?: object): NextRequest {
  const headers: Record<string, string> = {};
  if (principalJson) {
    headers["x-ms-client-principal"] = Buffer.from(
      JSON.stringify(principalJson)
    ).toString("base64");
  }
  return new NextRequest("http://localhost/api/test", { headers });
}

describe("getClientPrincipal", () => {
  it("returns null when header is absent", () => {
    expect(getClientPrincipal(makeRequest())).toBeNull();
  });

  it("parses a valid principal header", () => {
    const principal = { userId: "abc123", userDetails: "user@example.com", userRoles: ["authenticated"] };
    expect(getClientPrincipal(makeRequest(principal))).toEqual(principal);
  });

  it("returns null for malformed base64", () => {
    const req = new NextRequest("http://localhost/api/test", {
      headers: { "x-ms-client-principal": "not-valid-base64!!!" },
    });
    expect(getClientPrincipal(req)).toBeNull();
  });
});

describe("requireAuth", () => {
  it("returns null (pass-through) when principal is present", () => {
    const principal = { userId: "abc", userDetails: "u@e.com", userRoles: ["authenticated"] };
    expect(requireAuth(makeRequest(principal))).toBeNull();
  });

  it("returns a 401 Response when principal is absent", async () => {
    const response = requireAuth(makeRequest());
    expect(response).not.toBeNull();
    expect(response!.status).toBe(401);
    const body = await response!.json();
    expect(body.error).toBe("Unauthorized");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=auth
```
Expected: FAIL — "Cannot find module '@/lib/auth'"

- [ ] **Step 3: Write `src/lib/auth.ts`**

```typescript
import { NextRequest } from "next/server";

interface ClientPrincipal {
  identityProvider?: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export function getClientPrincipal(req: NextRequest): ClientPrincipal | null {
  const header = req.headers.get("x-ms-client-principal");
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf-8")) as ClientPrincipal;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): Response | null {
  if (!getClientPrincipal(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=auth
```
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts __tests__/lib/auth.test.ts
git commit -m "feat: add SWA auth helpers"
```

---

## Task 4: Employee API routes

**Files:**
- Create: `src/app/api/employees/route.ts`
- Create: `src/app/api/employees/[id]/route.ts`
- Create: `__tests__/api/employees.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/api/employees.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=employees
```
Expected: FAIL — "Cannot find module '@/app/api/employees/route'"

- [ ] **Step 3: Write `src/app/api/employees/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { employeesContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Employee } from "@/types";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { resources } = await employeesContainer.items.readAll<Employee>().fetchAll();
  return Response.json(resources);
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as { name: string; cadence: "weekly" | "biweekly" };
  const employee: Employee = {
    id: crypto.randomUUID(),
    name: body.name,
    token: crypto.randomUUID(),
    cadence: body.cadence,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await employeesContainer.items.create<Employee>(employee);
  return Response.json(resource, { status: 201 });
}
```

- [ ] **Step 4: Write `src/app/api/employees/[id]/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { employeesContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Employee } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as Partial<Pick<Employee, "name" | "cadence" | "token">>;
  const { resource: existing } = await employeesContainer.item(params.id, params.id).read<Employee>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: Employee = { ...existing, ...body };
  const { resource } = await employeesContainer.item(params.id, params.id).replace<Employee>(updated);
  return Response.json(resource);
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=employees
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/api/employees/ __tests__/api/employees.test.ts
git commit -m "feat: add employee API routes"
```

---

## Task 5: Meeting API routes + carryover logic

**Files:**
- Create: `src/app/api/meetings/route.ts`
- Create: `src/app/api/meetings/[id]/route.ts`
- Create: `__tests__/api/meetings.test.ts`
- Create: `__tests__/lib/carryover.test.ts`

- [ ] **Step 1: Write the carryover unit test**

Create `__tests__/lib/carryover.test.ts`:
```typescript
jest.mock("@/lib/cosmos", () => ({
  actionItemsContainer: {
    items: {
      query: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { carryOverIncompleteItems } from "@/lib/carryover";
import { actionItemsContainer } from "@/lib/cosmos";

const mockQuery = actionItemsContainer.items.query as jest.Mock;
const mockCreate = actionItemsContainer.items.create as jest.Mock;

beforeEach(() => jest.clearAllMocks());

it("copies incomplete items with carriedOver=true", async () => {
  const incompleteItems = [
    { id: "old-1", meetingId: "prev", employeeId: "emp", text: "Chase IT", assignee: "manager", completed: false, carriedOver: false, createdAt: "2026-01-01" },
  ];
  mockQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: incompleteItems }) });
  mockCreate.mockResolvedValue({});

  await carryOverIncompleteItems("prev-meeting-id", "new-meeting-id", "emp-id");

  expect(mockCreate).toHaveBeenCalledTimes(1);
  const created = mockCreate.mock.calls[0][0];
  expect(created.carriedOver).toBe(true);
  expect(created.completed).toBe(false);
  expect(created.meetingId).toBe("new-meeting-id");
  expect(created.text).toBe("Chase IT");
});

it("does nothing when there are no incomplete items", async () => {
  mockQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
  await carryOverIncompleteItems("prev", "new", "emp");
  expect(mockCreate).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=carryover
```
Expected: FAIL — "Cannot find module '@/lib/carryover'"

- [ ] **Step 3: Create `src/lib/carryover.ts`**

```typescript
import { actionItemsContainer } from "@/lib/cosmos";
import type { ActionItem } from "@/types";

export async function carryOverIncompleteItems(
  previousMeetingId: string,
  newMeetingId: string,
  employeeId: string
): Promise<void> {
  const { resources } = await actionItemsContainer.items
    .query<ActionItem>({
      query: "SELECT * FROM c WHERE c.meetingId = @mid AND c.completed = false",
      parameters: [{ name: "@mid", value: previousMeetingId }],
    })
    .fetchAll();

  await Promise.all(
    resources.map((item) =>
      actionItemsContainer.items.create<ActionItem>({
        id: crypto.randomUUID(),
        meetingId: newMeetingId,
        employeeId,
        text: item.text,
        assignee: item.assignee,
        completed: false,
        carriedOver: true,
        createdAt: new Date().toISOString(),
      })
    )
  );
}
```

- [ ] **Step 4: Run carryover tests to verify they pass**

```bash
npm test -- --testPathPattern=carryover
```
Expected: PASS

- [ ] **Step 5: Write the meeting API tests**

Create `__tests__/api/meetings.test.ts`:
```typescript
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
import { PUT } from "@/app/api/meetings/[id]/route";
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
```

- [ ] **Step 6: Run meeting tests to verify they fail**

```bash
npm test -- --testPathPattern="api/meetings"
```
Expected: FAIL — "Cannot find module '@/app/api/meetings/route'"

- [ ] **Step 7: Write `src/app/api/meetings/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { meetingsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import { carryOverIncompleteItems } from "@/lib/carryover";
import type { Meeting } from "@/types";

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { employeeId, meetingDate } = await req.json() as { employeeId: string; meetingDate: string };

  // Find the most recent previous meeting
  const { resources: previous } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
      parameters: [{ name: "@eid", value: employeeId }],
    })
    .fetchAll();

  const meeting: Meeting = {
    id: crypto.randomUUID(),
    employeeId,
    meetingDate,
    createdAt: new Date().toISOString(),
    sections: {
      whatsOnYourMind: [],
      winOfWeek: "",
      workingOn: "",
      blockers: "",
    },
  };

  const { resource } = await meetingsContainer.items.create<Meeting>(meeting);

  if (previous.length > 0) {
    await carryOverIncompleteItems(previous[0].id, resource!.id, employeeId);
  }

  return Response.json(resource, { status: 201 });
}
```

- [ ] **Step 8: Write `src/app/api/meetings/[id]/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { meetingsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Meeting } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Called by employee page via token route — no auth check here
  const { resource } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!resource) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(resource);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Both manager and employee pages call this — no auth check (token-gated at the page level)
  const body = await req.json() as Partial<Meeting["sections"]>;
  const { resource: existing } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: Meeting = { ...existing, sections: { ...existing.sections, ...body } };
  const { resource } = await meetingsContainer.item(params.id, params.id).replace<Meeting>(updated);
  return Response.json(resource);
}
```

- [ ] **Step 9: Run all meeting tests to verify they pass**

```bash
npm test -- --testPathPattern="meetings|carryover"
```
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/app/api/meetings/ src/lib/carryover.ts __tests__/
git commit -m "feat: add meeting API routes with carryover logic"
```

---

## Task 6: Action items API routes

**Files:**
- Create: `src/app/api/action-items/route.ts`
- Create: `src/app/api/action-items/[id]/route.ts`
- Create: `__tests__/api/action-items.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/api/action-items.test.ts`:
```typescript
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=action-items
```
Expected: FAIL

- [ ] **Step 3: Write `src/app/api/action-items/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { actionItemsContainer } from "@/lib/cosmos";
import type { ActionItem } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json() as Pick<ActionItem, "meetingId" | "employeeId" | "text" | "assignee">;
  const item: ActionItem = {
    id: crypto.randomUUID(),
    ...body,
    completed: false,
    carriedOver: false,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await actionItemsContainer.items.create<ActionItem>(item);
  return Response.json(resource, { status: 201 });
}
```

- [ ] **Step 4: Write `src/app/api/action-items/[id]/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { actionItemsContainer } from "@/lib/cosmos";
import type { ActionItem } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json() as Partial<Pick<ActionItem, "completed" | "text">>;
  const { resource: existing } = await actionItemsContainer.item(params.id, params.id).read<ActionItem>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: ActionItem = { ...existing, ...body };
  const { resource } = await actionItemsContainer.item(params.id, params.id).replace<ActionItem>(updated);
  return Response.json(resource);
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=action-items
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/api/action-items/ __tests__/api/action-items.test.ts
git commit -m "feat: add action items API routes"
```

---

## Task 7: Token lookup API route (public)

**Files:**
- Create: `src/app/api/1on1/[token]/route.ts`
- Create: `__tests__/api/token.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/token.test.ts`:
```typescript
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
const actionItems = [{ id: "ai-1", meetingId: "m1", text: "Chase IT", assignee: "manager", completed: false, carriedOver: true }];

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=token
```
Expected: FAIL

- [ ] **Step 3: Write `src/app/api/1on1/[token]/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import type { Employee, Meeting, ActionItem } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  // Look up employee by token
  const { resources: employees } = await employeesContainer.items
    .query<Employee>({
      query: "SELECT * FROM c WHERE c.token = @token",
      parameters: [{ name: "@token", value: params.token }],
    })
    .fetchAll();

  if (employees.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const employee = employees[0];

  // Get most recent meeting
  const { resources: meetings } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
      parameters: [{ name: "@eid", value: employee.id }],
    })
    .fetchAll();

  if (meetings.length === 0) {
    return Response.json({ employee, meeting: null, actionItems: [] });
  }

  const meeting = meetings[0];

  // Get action items for this meeting
  const { resources: actionItems } = await actionItemsContainer.items
    .query<ActionItem>({
      query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
      parameters: [{ name: "@mid", value: meeting.id }],
    })
    .fetchAll();

  return Response.json({ employee, meeting, actionItems });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=token
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/1on1/ __tests__/api/token.test.ts
git commit -m "feat: add token lookup API route"
```

---

## Task 8: SWA config and layout

**Files:**
- Create: `staticwebapp.config.json`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write `staticwebapp.config.json`**

```json
{
  "routes": [
    {
      "route": "/1on1/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/api/1on1/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "redirect": "/.auth/login/aad",
      "statusCode": 302
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN"
  }
}
```

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1:1 Meetings",
  description: "Private 1-on-1 meeting agendas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add staticwebapp.config.json src/app/layout.tsx
git commit -m "feat: add SWA route config and root layout"
```

---

## Task 9: Manager Dashboard

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/EmployeeCard.tsx`
- Create: `src/components/AddEmployeeForm.tsx`

- [ ] **Step 1: Write `src/components/EmployeeCard.tsx`**

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import type { Employee, Meeting } from "@/types";

interface Props {
  employee: Employee;
  lastMeeting: Meeting | null;
}

export default function EmployeeCard({ employee, lastMeeting }: Props) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const employeeUrl = `${baseUrl}/1on1/${employee.token}`;

  async function startMeeting() {
    setStarting(true);
    await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: employee.id,
        meetingDate: new Date().toISOString().slice(0, 10),
      }),
    });
    setStarting(false);
    window.location.reload();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(employeeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/employee/${employee.id}`} className="font-semibold text-gray-900 hover:underline">
            {employee.name}
          </Link>
          <p className="text-sm text-gray-500 capitalize">{employee.cadence}</p>
        </div>
        <button
          onClick={copyLink}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-400 transition"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p className="text-sm text-gray-500">
        {lastMeeting
          ? `Last meeting: ${new Date(lastMeeting.meetingDate).toLocaleDateString()}`
          : "No meetings yet"}
      </p>
      <button
        onClick={startMeeting}
        disabled={starting}
        className="mt-1 w-full bg-gray-900 text-white text-sm font-medium rounded-lg py-2 hover:bg-gray-700 transition disabled:opacity-50"
      >
        {starting ? "Starting…" : "Start Meeting"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/AddEmployeeForm.tsx`**

```tsx
"use client";
import { useState } from "react";

export default function AddEmployeeForm() {
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "biweekly">("weekly");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), cadence }),
    });
    setSaving(false);
    setName("");
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Employee name"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Cadence</label>
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value as "weekly" | "biweekly")}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-700 transition disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add Employee"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write `src/app/page.tsx`**

```tsx
import { employeesContainer, meetingsContainer } from "@/lib/cosmos";
import type { Employee, Meeting } from "@/types";
import EmployeeCard from "@/components/EmployeeCard";
import AddEmployeeForm from "@/components/AddEmployeeForm";

async function getEmployeesWithLastMeeting(): Promise<{ employee: Employee; lastMeeting: Meeting | null }[]> {
  const { resources: employees } = await employeesContainer.items
    .readAll<Employee>()
    .fetchAll();

  return Promise.all(
    employees.map(async (employee) => {
      const { resources: meetings } = await meetingsContainer.items
        .query<Meeting>({
          query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
          parameters: [{ name: "@eid", value: employee.id }],
        })
        .fetchAll();
      return { employee, lastMeeting: meetings[0] ?? null };
    })
  );
}

export default async function DashboardPage() {
  const data = await getEmployeesWithLastMeeting();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">1:1 Meetings</h1>
      </div>
      <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Add Employee</h2>
        <AddEmployeeForm />
      </div>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No employees yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(({ employee, lastMeeting }) => (
            <EmployeeCard key={employee.id} employee={employee} lastMeeting={lastMeeting} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/EmployeeCard.tsx src/components/AddEmployeeForm.tsx
git commit -m "feat: add manager dashboard"
```

---

## Task 10: Employee History Page

**Files:**
- Create: `src/app/employee/[id]/page.tsx`
- Create: `src/components/MeetingAccordion.tsx`

- [ ] **Step 1: Write `src/components/MeetingAccordion.tsx`**

```tsx
"use client";
import { useState } from "react";
import type { Meeting, ActionItem } from "@/types";

interface Props {
  meeting: Meeting;
  actionItems: ActionItem[];
}

export default function MeetingAccordion({ meeting, actionItems }: Props) {
  const [open, setOpen] = useState(false);
  const { sections } = meeting;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-medium text-gray-900">
          {new Date(meeting.meetingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 space-y-4 pt-4">
          {sections.whatsOnYourMind.length > 0 && (
            <Section label="What's on your mind?">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {sections.whatsOnYourMind.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </Section>
          )}
          {sections.winOfWeek && <Section label="Win of the week"><p className="text-sm text-gray-700">{sections.winOfWeek}</p></Section>}
          {sections.workingOn && <Section label="What are you working on?"><p className="text-sm text-gray-700">{sections.workingOn}</p></Section>}
          {sections.blockers && <Section label="Blockers, priorities, follow-ups"><p className="text-sm text-gray-700">{sections.blockers}</p></Section>}
          {actionItems.length > 0 && (
            <Section label="Actions">
              <ul className="space-y-2">
                {actionItems.map((ai) => (
                  <li key={ai.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className={ai.completed ? "line-through text-gray-400" : ""}>{ai.text}</span>
                    <span className="ml-auto text-xs text-gray-400 capitalize">{ai.assignee}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/employee/[id]/page.tsx`**

```tsx
import Link from "next/link";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import type { Employee, Meeting, ActionItem } from "@/types";
import MeetingAccordion from "@/components/MeetingAccordion";

async function getData(id: string) {
  const { resource: employee } = await employeesContainer.item(id, id).read<Employee>();
  const { resources: meetings } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
      parameters: [{ name: "@eid", value: id }],
    })
    .fetchAll();

  const meetingsWithItems = await Promise.all(
    meetings.map(async (meeting) => {
      const { resources: actionItems } = await actionItemsContainer.items
        .query<ActionItem>({
          query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
          parameters: [{ name: "@mid", value: meeting.id }],
        })
        .fetchAll();
      return { meeting, actionItems };
    })
  );

  return { employee, meetingsWithItems };
}

export default async function EmployeeHistoryPage({ params }: { params: { id: string } }) {
  const { employee, meetingsWithItems } = await getData(params.id);

  if (!employee) return <p className="p-10 text-gray-500">Employee not found.</p>;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block">← Dashboard</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{employee.name}</h1>
      <p className="text-sm text-gray-500 capitalize mb-8">{employee.cadence} • {meetingsWithItems.length} meetings</p>
      {meetingsWithItems.length === 0 ? (
        <p className="text-gray-500 text-sm">No meetings yet.</p>
      ) : (
        <div className="space-y-3">
          {meetingsWithItems.map(({ meeting, actionItems }) => (
            <MeetingAccordion key={meeting.id} meeting={meeting} actionItems={actionItems} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/employee/ src/components/MeetingAccordion.tsx
git commit -m "feat: add employee history page"
```

---

## Task 11: Employee Meeting Page

**Files:**
- Create: `src/components/TopicList.tsx`
- Create: `src/components/SectionCard.tsx`
- Create: `src/components/ActionItemList.tsx`
- Create: `src/components/MeetingEditor.tsx`
- Create: `src/app/1on1/[token]/page.tsx`

- [ ] **Step 1: Write `src/components/TopicList.tsx`**

```tsx
"use client";
import { useState } from "react";

interface Props {
  topics: string[];
  meetingId: string;
  onChange: (topics: string[]) => void;
}

export default function TopicList({ topics, meetingId, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function addTopic() {
    if (!draft.trim()) return;
    onChange([...topics, draft.trim()]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      {topics.map((topic, i) => (
        <p key={i} className="text-sm text-gray-800 before:content-['•'] before:mr-2 before:text-gray-400">{topic}</p>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
          placeholder="Add a topic…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          onClick={addTopic}
          className="text-sm px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-gray-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/SectionCard.tsx`**

```tsx
interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SectionCard({ label, value, onChange, placeholder }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ""}
        rows={3}
        className="w-full resize-none text-sm text-gray-800 placeholder-gray-300 focus:outline-none"
      />
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/ActionItemList.tsx`**

```tsx
"use client";
import { useState } from "react";
import type { ActionItem } from "@/types";

interface Props {
  items: ActionItem[];
  meetingId: string;
  employeeId: string;
  employeeName: string;
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (item: ActionItem) => void;
}

export default function ActionItemList({ items, meetingId, employeeId, employeeName, onToggle, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [assignee, setAssignee] = useState<"manager" | "employee">("employee");
  const [saving, setSaving] = useState(false);

  const carried = items.filter((i) => i.carriedOver);
  const current = items.filter((i) => !i.carriedOver);

  async function addItem() {
    if (!text.trim()) return;
    setSaving(true);
    const res = await fetch("/api/action-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, employeeId, text: text.trim(), assignee }),
    });
    const newItem: ActionItem = await res.json();
    onAdd(newItem);
    setText("");
    setShowForm(false);
    setSaving(false);
  }

  async function toggle(item: ActionItem) {
    await fetch(`/api/action-items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    });
    onToggle(item.id, !item.completed);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Actions from this meeting</p>

      {carried.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-700 mb-2">Carried over from last time</p>
          {carried.map((item) => <ActionRow key={item.id} item={item} employeeName={employeeName} onToggle={() => toggle(item)} />)}
        </div>
      )}

      <div className="space-y-2">
        {current.map((item) => (
          <ActionRow key={item.id} item={item} employeeName={employeeName} onToggle={() => toggle(item)} />
        ))}
      </div>

      {showForm ? (
        <div className="mt-4 flex flex-col gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Action item…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <div className="flex gap-2 items-center">
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value as "manager" | "employee")}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            >
              <option value="employee">{employeeName}</option>
              <option value="manager">You</option>
            </select>
            <button onClick={addItem} disabled={saving || !text.trim()} className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          + Add action
        </button>
      )}
    </div>
  );
}

function ActionRow({ item, employeeName, onToggle }: { item: ActionItem; employeeName: string; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
      />
      <span className={`flex-1 text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-800"}`}>{item.text}</span>
      <span className="text-xs text-gray-400">{item.assignee === "manager" ? "You" : employeeName}</span>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/MeetingEditor.tsx`**

```tsx
"use client";
import { useRef, useState } from "react";
import type { Meeting, ActionItem, MeetingSections } from "@/types";
import TopicList from "@/components/TopicList";
import SectionCard from "@/components/SectionCard";
import ActionItemList from "@/components/ActionItemList";
import MeetingAccordion from "@/components/MeetingAccordion";

interface Props {
  meeting: Meeting;
  actionItems: ActionItem[];
  employeeId: string;
  employeeName: string;
  pastMeetings: { meeting: Meeting; actionItems: ActionItem[] }[];
}

export default function MeetingEditor({ meeting, actionItems: initialItems, employeeId, employeeName, pastMeetings }: Props) {
  const [sections, setSections] = useState<MeetingSections>(meeting.sections);
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const saveTimer = useRef<NodeJS.Timeout>();

  function handleSectionChange(field: keyof Omit<MeetingSections, "whatsOnYourMind">, value: string) {
    const updated = { ...sections, [field]: value };
    setSections(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    }, 800);
  }

  function handleTopicsChange(topics: string[]) {
    const updated = { ...sections, whatsOnYourMind: topics };
    setSections(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsOnYourMind: topics }),
      });
    }, 800);
  }

  function handleToggle(id: string, completed: boolean) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, completed } : i));
  }

  function handleAddItem(item: ActionItem) {
    setItems((prev) => [...prev, item]);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What's on your mind?</p>
        <TopicList topics={sections.whatsOnYourMind} meetingId={meeting.id} onChange={handleTopicsChange} />
      </div>

      <SectionCard
        label="Win of the week"
        value={sections.winOfWeek}
        onChange={(v) => handleSectionChange("winOfWeek", v)}
        placeholder="What's one thing you're proud of since we last met?"
      />

      <SectionCard
        label="What are you working on?"
        value={sections.workingOn}
        onChange={(v) => handleSectionChange("workingOn", v)}
        placeholder="Blockers, priorities, current focus…"
      />

      <SectionCard
        label="Blockers, priorities, follow-ups"
        value={sections.blockers}
        onChange={(v) => handleSectionChange("blockers", v)}
        placeholder="Anything blocking you or needing follow-up?"
      />

      <ActionItemList
        items={items}
        meetingId={meeting.id}
        employeeId={employeeId}
        employeeName={employeeName}
        onToggle={handleToggle}
        onAdd={handleAddItem}
      />

      {pastMeetings.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6">Previous meetings</p>
          <div className="space-y-2">
            {pastMeetings.map(({ meeting: m, actionItems: ai }) => (
              <MeetingAccordion key={m.id} meeting={m} actionItems={ai} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Write `src/app/1on1/[token]/page.tsx`**

```tsx
import { meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import type { Meeting, ActionItem } from "@/types";
import MeetingEditor from "@/components/MeetingEditor";

async function getPageData(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/1on1/${token}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<{ employee: { id: string; name: string }; meeting: Meeting | null; actionItems: ActionItem[] }>;
}

async function getPastMeetings(employeeId: string, currentMeetingId: string) {
  const { resources: meetings } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT * FROM c WHERE c.employeeId = @eid AND c.id != @mid ORDER BY c.meetingDate DESC",
      parameters: [
        { name: "@eid", value: employeeId },
        { name: "@mid", value: currentMeetingId },
      ],
    })
    .fetchAll();

  return Promise.all(
    meetings.map(async (meeting) => {
      const { resources: actionItems } = await actionItemsContainer.items
        .query<ActionItem>({
          query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
          parameters: [{ name: "@mid", value: meeting.id }],
        })
        .fetchAll();
      return { meeting, actionItems };
    })
  );
}

export default async function EmployeeMeetingPage({ params }: { params: { token: string } }) {
  const data = await getPageData(params.token);

  if (!data) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500">This link is invalid or has expired.</p>
      </main>
    );
  }

  const { employee, meeting, actionItems } = data;

  if (!meeting) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500">No meeting has been started yet. Check back after your manager starts one.</p>
      </main>
    );
  }

  const pastMeetings = await getPastMeetings(employee.id, meeting.id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(meeting.meetingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <MeetingEditor
        meeting={meeting}
        actionItems={actionItems}
        employeeId={employee.id}
        employeeName={employee.name}
        pastMeetings={pastMeetings}
      />
    </main>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/1on1/ src/components/
git commit -m "feat: add employee meeting page and components"
```

---

## Task 12: Run the app locally and verify

- [ ] **Step 1: Install the Azure SWA CLI**

```bash
npm install -g @azure/static-web-apps-cli
```

- [ ] **Step 2: Create Cosmos DB and containers**

In the Azure Portal (or Azure CLI):
```bash
# Create resource group
az group create --name rg-1on1 --location eastus

# Create Cosmos DB account (free tier)
az cosmosdb create \
  --name cosmos-1on1-<your-unique-suffix> \
  --resource-group rg-1on1 \
  --default-consistency-level Session \
  --enable-free-tier true

# Create database
az cosmosdb sql database create \
  --account-name cosmos-1on1-<suffix> \
  --resource-group rg-1on1 \
  --name 1on1db

# Create containers
az cosmosdb sql container create --account-name cosmos-1on1-<suffix> --resource-group rg-1on1 --database-name 1on1db --name employees --partition-key-path /id
az cosmosdb sql container create --account-name cosmos-1on1-<suffix> --resource-group rg-1on1 --database-name 1on1db --name meetings --partition-key-path /employeeId
az cosmosdb sql container create --account-name cosmos-1on1-<suffix> --resource-group rg-1on1 --database-name 1on1db --name actionItems --partition-key-path /employeeId

# Get connection string
az cosmosdb keys list --name cosmos-1on1-<suffix> --resource-group rg-1on1 --type connection-strings
```

Copy the primary connection string into `.env.local` as `COSMOS_CONNECTION_STRING`.

- [ ] **Step 3: Start the dev server**

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll see the dashboard (SWA auth is bypassed in local dev with `next dev`).

Add an employee, start a meeting, copy the link, visit it in a private window.

- [ ] **Step 4: Run all tests**

```bash
npm test
```
Expected: All tests pass.

- [ ] **Step 5: Commit any fixes, then tag ready for deployment**

```bash
git add .
git commit -m "feat: 1on1 app complete"
```

---

## Task 13: Deploy to Azure Static Web Apps

- [ ] **Step 1: Create the SWA resource in Azure**

In the Azure Portal, create a new Static Web App. Choose:
- Source: GitHub
- Repository: your repo
- Branch: `main`
- Build preset: **Next.js**
- App location: `/1on1-app`
- Output location: `.next`

Azure will auto-generate a GitHub Actions workflow file. Pull it into your local branch.

- [ ] **Step 2: Add environment variables in Azure Portal**

In the SWA resource → Configuration → Application settings, add:
```
COSMOS_CONNECTION_STRING=<your connection string>
COSMOS_DB_NAME=1on1db
NEXT_PUBLIC_BASE_URL=https://<your-swa-domain>.azurestaticapps.net
```

- [ ] **Step 3: Push to main to trigger deployment**

```bash
git push origin main
```

Watch the GitHub Actions workflow complete. Visit your SWA URL — you'll be prompted to log in with Microsoft before accessing the dashboard.

- [ ] **Step 4: Test the deployed app**

1. Log in with your Microsoft account — dashboard should appear
2. Add an employee
3. Start a meeting
4. Copy the employee link and open it in a private/incognito window (no login required)
5. Add topics, fill in sections, add an action item
6. Go back to the dashboard — verify the meeting shows under that employee
