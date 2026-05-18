export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import { parsePrincipal } from "@/lib/auth";
import { carryOverIncompleteItems } from "@/lib/carryover";
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

  const lastMeeting = meetings[0] ?? null;

  // Create a new meeting if none exists or if the last one is old enough
  if (shouldCreateMeeting(lastMeeting)) {
    const today = new Date().toISOString().slice(0, 10);

    // Guard against duplicates: re-check if a meeting for today already exists
    const { resources: todayCheck } = await meetingsContainer.items
      .query<Meeting>({
        query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid AND c.meetingDate = @today",
        parameters: [{ name: "@eid", value: employee.id }, { name: "@today", value: today }],
      })
      .fetchAll();

    if (todayCheck.length > 0) {
      return buildPageData(employee, todayCheck[0]);
    }

    // Count existing meetings to assign sequential number
    const { resources: allMeetings } = await meetingsContainer.items
      .query<Meeting>({
        query: "SELECT VALUE COUNT(1) FROM c WHERE c.employeeId = @eid",
        parameters: [{ name: "@eid", value: employee.id }],
      })
      .fetchAll();
    const meetingNumber = ((allMeetings[0] as unknown as number) ?? 0) + 1;

    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      meetingDate: today,
      createdAt: new Date().toISOString(),
      number: meetingNumber,
      sections: {
        whatsOnYourMind: [],
        workingOn: "",
        blockers: "",
        growthFocus: "",
        supportNeeded: "",
        feedbackForManager: "",
        wantFeedbackOn: "",
        goingWellManager: "",
        areaToFocusManager: "",
        feedbackForManagerResponse: "",
        wantFeedbackOnResponse: "",
      },
    };

    try {
      await meetingsContainer.items.create(newMeeting);
      if (lastMeeting) await carryOverIncompleteItems(lastMeeting.id, newMeeting.id, employee.id);
    } catch {
      // If create failed (e.g. duplicate from race condition), fall through to fetch existing
      const { resources: fallback } = await meetingsContainer.items
        .query<Meeting>({
          query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
          parameters: [{ name: "@eid", value: employee.id }],
        })
        .fetchAll();
      if (fallback[0]) return buildPageData(employee, fallback[0]);
    }

    return buildPageData(employee, newMeeting);
  }

  return buildPageData(employee, lastMeeting!);
}

function shouldCreateMeeting(lastMeeting: Meeting | null): boolean {
  if (!lastMeeting) return true;
  const today = new Date().toISOString().slice(0, 10);
  return lastMeeting.meetingDate !== today;
}

async function buildPageData(employee: Employee, meeting: Meeting) {
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

  // Only the employee's assigned manager gets manager privileges
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
