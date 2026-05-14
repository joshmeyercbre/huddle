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
