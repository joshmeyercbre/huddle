export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Meeting, MeetingSections, ActionItem } from "@/types";

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
  const body = await req.json() as Partial<MeetingSections> & {
    submitted?: boolean;
    managerShared?: boolean;
    title?: string;
    managerNotes?: string;
    mood?: Meeting["mood"];
    meetingDate?: string;
  };

  // Manager-only operations require auth
  const { managerShared, managerNotes, meetingDate, ...rest } = body;
  if (managerShared !== undefined || managerNotes !== undefined || meetingDate !== undefined) {
    const authError = requireAuth(req);
    if (authError) return authError;
  }

  const { resource: existing } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const { submitted, title, mood, ...sectionFields } = rest;

  const updated: Meeting = {
    ...existing,
    sections: { ...existing.sections, ...sectionFields },
    ...(submitted !== undefined ? { submitted } : {}),
    ...(managerShared !== undefined ? { managerShared } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(managerNotes !== undefined ? { managerNotes } : {}),
    ...(mood !== undefined ? { mood } : {}),
    ...(meetingDate !== undefined ? { meetingDate } : {}),
  };

  const { resource } = await meetingsContainer.item(params.id, params.id).replace<Meeting>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  return Response.json(resource);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { resource: existing } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  // Delete associated action items
  const { resources: actionItems } = await actionItemsContainer.items
    .query<ActionItem>({
      query: "SELECT * FROM c WHERE c.meetingId = @mid",
      parameters: [{ name: "@mid", value: params.id }],
    })
    .fetchAll();

  await Promise.all(actionItems.map(item =>
    actionItemsContainer.item(item.id, item.id).delete()
  ));

  await meetingsContainer.item(params.id, params.id).delete();
  return Response.json({ ok: true });
}
