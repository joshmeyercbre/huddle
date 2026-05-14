import { NextRequest } from "next/server";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import type { Employee, Meeting, ActionItem } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
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

  const { resources: actionItems } = await actionItemsContainer.items
    .query<ActionItem>({
      query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
      parameters: [{ name: "@mid", value: meeting.id }],
    })
    .fetchAll();

  return Response.json({ employee, meeting, actionItems });
}
