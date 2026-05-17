export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import Link from "next/link";
import { employeesContainer, meetingsContainer, actionItemsContainer, retrosContainer } from "@/lib/cosmos";
import { carryOverIncompleteItems } from "@/lib/carryover";
import type { Employee, Meeting, ActionItem, Retro } from "@/types";
import HuddleViewer from "@/components/HuddleViewer";
import PortalShell from "@/components/PortalShell";

function needsNewMeeting(lastMeeting: Meeting | null, cadence: string): boolean {
  if (!lastMeeting) return true;
  const today = new Date().toISOString().slice(0, 10);
  if (lastMeeting.meetingDate === today) return false;
  const cadenceDays = cadence === "biweekly" ? 14 : 7;
  const daysSinceLast = (Date.now() - new Date(lastMeeting.meetingDate).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLast >= cadenceDays;
}

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

  if (needsNewMeeting(lastMeeting, employee.cadence)) {
    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      meetingDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      sections: { whatsOnYourMind: [], workingOn: "", blockers: "", growthFocus: "", supportNeeded: "", feedbackForManager: "", wantFeedbackOn: "", goingWellManager: "", areaToFocusManager: "", feedbackForManagerResponse: "", wantFeedbackOnResponse: "" },
    };
    await meetingsContainer.items.create(newMeeting);
    if (lastMeeting) await carryOverIncompleteItems(lastMeeting.id, newMeeting.id, employee.id);
    const { resources: actionItems } = await actionItemsContainer.items
      .query<ActionItem>({
        query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
        parameters: [{ name: "@mid", value: newMeeting.id }],
      })
      .fetchAll();
    return { employee, meeting: newMeeting, actionItems };
  }

  const { resources: actionItems } = await actionItemsContainer.items
    .query<ActionItem>({
      query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
      parameters: [{ name: "@mid", value: lastMeeting!.id }],
    })
    .fetchAll();

  return { employee, meeting: lastMeeting!, actionItems };
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

async function getRetros(managerId: string): Promise<Retro[]> {
  if (!managerId) return [];
  const { resources } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.managerId = @mid ORDER BY c.createdAt DESC",
      parameters: [{ name: "@mid", value: managerId }],
    })
    .fetchAll();
  return resources;
}

export default async function EmployeeMeetingPage({ params }: { params: { token: string } }) {
  const principalHeader = headers().get("x-ms-client-principal");
  const isManager = process.env.NODE_ENV === "development" || principalHeader !== null;

  const data = await getPageData(params.token);

  if (!data) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500">This link is invalid or has expired.</p>
      </main>
    );
  }

  const { employee, meeting, actionItems } = data;
  const [pastMeetings, retros] = await Promise.all([
    getPastMeetings(employee.id, meeting.id),
    getRetros(employee.managerId ?? ""),
  ]);

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
              {new Date(meeting.meetingDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
      </header>

      <PortalShell retros={retros}>
        <HuddleViewer
          currentMeeting={meeting}
          currentActionItems={actionItems}
          pastMeetings={pastMeetings}
          employeeId={employee.id}
          employeeName={employee.name}
          isManager={isManager}
        />
      </PortalShell>
    </div>
  );
}
