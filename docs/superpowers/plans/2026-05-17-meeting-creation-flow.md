# Meeting Creation Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove auto-creation from the employee huddle link and give managers an explicit "Schedule & Open" button on the dashboard to create a meeting for today.

**Architecture:** The huddle link becomes read-only — it shows the most recent meeting (or a "no meeting scheduled" state). The manager controls meeting creation via a button on each employee card that calls `POST /api/meetings` with today's date and redirects to the huddle. The auto-scheduler remains unchanged.

**Tech Stack:** Next.js 14 (App Router), TypeScript, React, Tailwind CSS

---

## Files Changed

| File | What changes |
|------|-------------|
| `src/app/huddle/[token]/page.tsx` | Remove `shouldCreateMeeting`, carryover import, and entire auto-creation block. Handle `meeting: null` in page render. |
| `src/components/EmployeeCard.tsx` | Add `useRouter`, scheduling state, `scheduleToday()` function, and conditional button label. |

No changes to `src/app/api/meetings/route.ts` or `src/app/api/schedule-meetings/route.ts`.

---

### Task 1: Simplify huddle page — remove auto-creation

**Files:**
- Modify: `src/app/huddle/[token]/page.tsx`

- [ ] **Step 1: Replace the entire file with the simplified version**

The new `getPageData` drops auto-creation entirely. It fetches the most recent meeting and returns it (or `null`). The page renders a "no meeting scheduled" state when `meeting` is null.

Open `src/app/huddle/[token]/page.tsx` and replace the full contents with:

```tsx
export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import { parsePrincipal } from "@/lib/auth";
import type { Employee, Meeting, ActionItem } from "@/types";
import HuddleViewer from "@/components/HuddleViewer";

async function getPageData(token: string) {
  const { resources: employees } = await employeesContainer.items
    .query<Employee>({
      query: "SELECT * FROM c WHERE c.token = @token",
      parameters: [{ name: "@token", value: token }],
    })
    .fetchAll();

  if (employees.length === 0) return null;
  const employee = employees[0];

  const { resources: meetings } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
      parameters: [{ name: "@eid", value: employee.id }],
    })
    .fetchAll();

  const meeting = meetings[0] ?? null;
  if (!meeting) return { employee, meeting: null, actionItems: [] as ActionItem[] };

  const { resources: actionItems } = await actionItemsContainer.items
    .query<ActionItem>({
      query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
      parameters: [{ name: "@mid", value: meeting.id }],
    })
    .fetchAll();

  return { employee, meeting, actionItems };
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
  const principalHeader = headers().get("x-ms-client-principal");
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
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="bg-cbre-green px-6 py-4 flex items-center gap-3">
          <div className="w-2 h-8 bg-cbre-mint rounded-sm" />
          <span className="text-xl font-bold text-white tracking-tight">Huddle</span>
          <span className="text-white/40">|</span>
          <span className="text-white font-medium">{employee.name}</span>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No meeting scheduled yet. Your manager will set one up soon.</p>
        </main>
      </div>
    );
  }

  const authenticatedUserId = parsePrincipal(principalHeader)?.userId ?? null;
  const isManager =
    process.env.NODE_ENV === "development" ||
    (authenticatedUserId !== null && authenticatedUserId === employee.managerId);

  const pastMeetings = await getPastMeetings(employee.id, meeting.id);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-cbre-green px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-8 bg-cbre-mint rounded-sm" />
        <div className="flex items-center gap-6 flex-1">
          <span className="text-xl font-bold text-white tracking-tight">Huddle</span>
          <span className="text-white/40">|</span>
          <div>
            <span className="text-white font-medium">{employee.name}</span>
            <span className="text-white/50 text-sm ml-3">
              {new Date(meeting.meetingDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      <HuddleViewer
        currentMeeting={meeting}
        currentActionItems={actionItems}
        pastMeetings={pastMeetings}
        employeeId={employee.id}
        employeeName={employee.name}
        isManager={isManager}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify the file has no references to `shouldCreateMeeting` or `carryOverIncompleteItems`**

```powershell
Select-String -Path "src/app/huddle/[token]/page.tsx" -Pattern "shouldCreate|carryOver"
```

Expected: no output (no matches)

- [ ] **Step 3: Run existing tests to confirm nothing is broken**

```powershell
npm test -- --passWithNoTests 2>&1 | Select-Object -Last 6
```

Expected: same pass/fail counts as before this change (failures are pre-existing, not introduced here)

- [ ] **Step 4: Commit**

```powershell
git add src/app/huddle/[token]/page.tsx
git commit -m "Remove auto-creation from huddle link — show most recent meeting only"
```

---

### Task 2: Add "Schedule & Open" button to EmployeeCard

**Files:**
- Modify: `src/components/EmployeeCard.tsx`

The button label changes based on whether a meeting already exists today:
- No meeting today → "Schedule & Open" → creates meeting then navigates to `/huddle/${employee.token}`
- Meeting today → "Open Huddle" → navigates directly (existing behavior)

- [ ] **Step 1: Replace the full file with the updated version**

Open `src/components/EmployeeCard.tsx` and replace the full contents with:

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Employee, Meeting } from "@/types";

interface Props {
  employee: Employee;
  lastMeeting: Meeting | null;
}

export default function EmployeeCard({ employee, lastMeeting }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const employeeUrl = `${baseUrl}/huddle/${employee.token}`;

  const today = new Date().toISOString().slice(0, 10);
  const hasMeetingToday = lastMeeting?.meetingDate === today;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(employeeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  async function scheduleToday() {
    setScheduling(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: employee.id, meetingDate: today }),
    });
    setScheduling(false);
    // 201 = created, 409 = already exists — either way navigate to the huddle
    if (res.ok || res.status === 409) {
      router.push(`/huddle/${employee.token}`);
    }
  }

  const statusBadge = lastMeeting?.managerShared
    ? { label: "Reviewed", className: "text-gray-400" }
    : lastMeeting?.submitted
    ? { label: "Ready", className: "text-cbre-mint font-semibold" }
    : lastMeeting
    ? { label: "In progress", className: "text-gray-400" }
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:border-cbre-mint transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/employee/${employee.id}`} className="font-semibold text-cbre-green hover:underline">
            {employee.name}
          </Link>
          <p className="text-xs font-mono text-gray-400 mt-0.5">#{employee.id.slice(0, 8)}</p>
          <p className="text-sm text-gray-500 capitalize mt-0.5">{employee.cadence}</p>
        </div>
        <button
          onClick={copyLink}
          className="text-xs text-gray-400 hover:text-cbre-green px-2 py-1 rounded border border-gray-200 hover:border-cbre-mint transition-colors"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {lastMeeting
            ? `Last: ${new Date(lastMeeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "No meetings yet"}
        </span>
        {statusBadge && (
          <span className={`text-xs ${statusBadge.className}`}>{statusBadge.label}</span>
        )}
      </div>

      {hasMeetingToday ? (
        <Link
          href={`/huddle/${employee.token}`}
          className="w-full text-center bg-cbre-green text-white text-sm font-medium rounded-lg py-2 hover:bg-cbre-mint hover:text-cbre-green transition-colors"
        >
          Open Huddle
        </Link>
      ) : (
        <button
          onClick={scheduleToday}
          disabled={scheduling}
          className="w-full text-center bg-cbre-green text-white text-sm font-medium rounded-lg py-2 hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-50"
        >
          {scheduling ? "Scheduling…" : "Schedule & Open"}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```powershell
npx tsc --noEmit 2>&1 | Select-Object -Last 10
```

Expected: no output (zero errors)

- [ ] **Step 3: Run tests**

```powershell
npm test -- --passWithNoTests 2>&1 | Select-Object -Last 6
```

Expected: same pass/fail counts as after Task 1

- [ ] **Step 4: Commit**

```powershell
git add src/components/EmployeeCard.tsx
git commit -m "Add Schedule & Open button to employee card — manager controls meeting creation"
```

---

### Task 3: Push and verify

- [ ] **Step 1: Push to remote**

```powershell
git push origin main
```

Expected: `main -> main` with the two new commits

- [ ] **Step 2: Manual smoke test**

Open the app locally with `npm run dev`, then verify:

1. **Dashboard with no meeting today** — each employee card shows "Schedule & Open" button
2. **Click "Schedule & Open"** — creates a meeting and navigates to `/huddle/<token>` showing today's meeting
3. **Return to dashboard** — the card for that employee now shows "Open Huddle" (meeting exists today)
4. **Click "Open Huddle"** — navigates directly without creating a duplicate
5. **Employee visits their huddle link directly** — sees their current meeting (no new meeting created)
6. **Employee with no meetings visits huddle link** — sees "No meeting scheduled yet" message
