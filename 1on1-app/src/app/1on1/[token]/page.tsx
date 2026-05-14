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
