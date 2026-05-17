export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Employee, Meeting, ActionItem } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as Partial<Pick<Employee, "name" | "cadence" | "token" | "email" | "notifyDaysBefore">>;
  const { resource: existing } = await employeesContainer.item(params.id, params.id).read<Employee>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: Employee = { ...existing, ...body };
  const { resource } = await employeesContainer.item(params.id, params.id).replace<Employee>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { resources: meetings } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT c.id FROM c WHERE c.employeeId = @eid",
      parameters: [{ name: "@eid", value: params.id }],
    })
    .fetchAll();

  await Promise.all(
    meetings.map(async (meeting) => {
      const { resources: items } = await actionItemsContainer.items
        .query<ActionItem>({
          query: "SELECT c.id FROM c WHERE c.meetingId = @mid",
          parameters: [{ name: "@mid", value: meeting.id }],
        })
        .fetchAll();
      await Promise.all(items.map((i) => actionItemsContainer.item(i.id, i.id).delete()));
      await meetingsContainer.item(meeting.id, meeting.id).delete();
    })
  );

  await employeesContainer.item(params.id, params.id).delete();
  return new Response(null, { status: 204 });
}
