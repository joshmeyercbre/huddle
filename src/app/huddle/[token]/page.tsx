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
