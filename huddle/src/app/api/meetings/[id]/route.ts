export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { meetingsContainer, employeesContainer, actionItemsContainer } from "@/lib/cosmos";
import { sendMeetingSummary } from "@/lib/notify";
import type { Meeting, MeetingSections, Employee, ActionItem } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { resource } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!resource) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(resource);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json() as Partial<MeetingSections> & { completedAt?: string; sentiment?: 1 | 2 | 3 | 4 | 5 };
  const { completedAt, sentiment, ...sectionUpdates } = body;

  const { resource: existing } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: Meeting = {
    ...existing,
    sections: { ...existing.sections, ...sectionUpdates },
    ...(completedAt ? { completedAt } : {}),
    ...(sentiment !== undefined ? { sentiment } : {}),
  };

  const { resource } = await meetingsContainer.item(params.id, params.id).replace<Meeting>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  if (completedAt && !existing.completedAt) {
    const { resource: employee } = await employeesContainer.item(existing.employeeId, existing.employeeId).read<Employee>();
    const { resources: actionItems } = await actionItemsContainer.items
      .query<ActionItem>({
        query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
        parameters: [{ name: "@mid", value: existing.id }],
      })
      .fetchAll();
    if (employee) {
      await sendMeetingSummary(employee, resource, actionItems);
    }
  }

  return Response.json(resource);
}
