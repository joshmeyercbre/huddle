# 1-on-1 Meeting App — Design Spec
**Date:** 2026-05-14

## Overview

A lightweight standalone web app for managing weekly or bi-weekly 1-on-1 meetings with direct reports. The manager controls a dashboard; each employee gets a private, shareable URL to view and edit their own agenda. No employee can see another's content.

---

## Tech Stack

| Layer | Choice | Cost |
|---|---|---|
| Frontend + API | Next.js (TypeScript + Tailwind) | Free |
| Hosting + Serverless Functions | Azure Static Web Apps (Free tier) | $0/mo |
| Database | Azure Cosmos DB for NoSQL (Free tier) | $0/mo |
| Manager Auth | Azure SWA built-in Microsoft login | Free |

---

## Architecture

- Next.js app deployed to Azure Static Web Apps
- API routes exposed as Azure Functions (built into SWA)
- Cosmos DB stores all data in three collections
- Manager authenticates via Microsoft (SWA built-in auth — no extra setup)
- Employees access their page via a UUID token in the URL — no login required

---

## Data Model

### Collection: `employees`
```json
{
  "id": "uuid",
  "name": "string",
  "token": "uuid (private URL key)",
  "cadence": "weekly | biweekly",
  "createdAt": "ISO date"
}
```

### Collection: `meetings`
```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "meetingDate": "ISO date",
  "createdAt": "ISO date",
  "sections": {
    "whatsOnYourMind": ["string"],
    "winOfWeek": "string",
    "workingOn": "string",
    "blockers": "string"
  }
}
```

### Collection: `actionItems`
```json
{
  "id": "uuid",
  "meetingId": "uuid",
  "employeeId": "uuid",
  "text": "string",
  "assignee": "manager | employee",
  "completed": "boolean",
  "carriedOver": "boolean",
  "createdAt": "ISO date"
}
```

---

## Routes

### Manager-facing (Microsoft login required)
| Route | Description |
|---|---|
| `/` | Dashboard — all direct reports as cards |
| `/employee/[id]` | Full meeting history for one employee |
| `/employee/[id]/meeting/[meetingId]` | Individual meeting detail (read-only past, editable current) |

### Employee-facing (token in URL, no login)
| Route | Description |
|---|---|
| `/1on1/[token]` | Current meeting agenda — editable sections + action items |

---

## Pages

### Manager Dashboard (`/`)
- One card per direct report showing: name, cadence, last meeting date
- "Start Meeting" button per card — creates a new meeting record and sets `meetingDate` to today
- Copy-link icon to copy that employee's private URL
- "Add Employee" form: name, cadence selector
- Clicking an employee card opens their history page

### Employee History (`/employee/[id]`)
- All past meetings in reverse chronological order
- Each meeting expandable to show full agenda and action items (read-only)

### Employee Meeting Page (`/1on1/[token]`)
- Header: employee name + meeting date
- **Sections (each as a card):**
  1. **What's on your mind?** — bulleted list, employee adds topics one at a time
  2. **Win of the week** — single text area
  3. **What are you working on?** — single text area
  4. **Blockers, priorities, follow-ups** — single text area
- **Actions from this meeting** — checklist at the bottom
  - Each item shows: text, assignee badge ("You" or manager's name), completion checkbox
  - "Add action" button opens inline form: text input + assignee selector
  - Incomplete action items carried over from the previous meeting appear in a soft banner: "Carried over from last time"
- **Previous meetings** — collapsed accordion below the current agenda (read-only)

---

## Behavior

- **Auto-save:** All edits save automatically on change (debounced 800ms). No submit button.
- **Both sides can edit:** Manager and employee can both edit the current meeting's content. Last write wins (no conflict resolution needed at this scale).
- **Action item carryover:** When a new meeting is created for an employee, any incomplete action items from their most recent meeting are copied into the new meeting with a `carriedOver: true` flag.
- **Private URLs:** Employee tokens are UUIDs. Regenerating a token (manager action) invalidates the old link. The employee must be re-sent the new link.
- **No delete:** Meetings and action items are never deleted — the history is always preserved.

---

## Security

- Manager dashboard protected by SWA built-in Microsoft authentication
- Employee pages are secured by UUID token obscurity — no server-side auth, but tokens are unguessable (128-bit random)
- API routes validate that: manager routes require authenticated session; employee routes validate token matches a known employee
- HTTPS enforced by Azure Static Web Apps

---

## Out of Scope

- Email/notification sending (employees are sent their link manually)
- Real-time collaborative editing (auto-save + last-write-wins is sufficient)
- Mobile app (responsive web only)
- Multi-manager support (single manager per deployment)
