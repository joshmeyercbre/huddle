export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { meetingsContainer } from "@/lib/cosmos";
import type { Meeting, MeetingSections } from "@/types";

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
  const body = await req.json() as Partial<Omit<MeetingSections, "whatsOnYourMind">> & { whatsOnYourMind?: string[]; submitted?: boolean; managerShared?: boolean; title?: string; managerNotes?: string; mood?: Meeting["mood"] };
  const { resource: existing } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const { submitted, managerShared, title, managerNotes, mood, ...sectionFields } = body;
  const updated: Meeting = {
    ...existing,
    sections: { ...existing.sections, ...sectionFields },
    ...(submitted !== undefined ? { submitted } : {}),
    ...(managerShared !== undefined ? { managerShared } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(managerNotes !== undefined ? { managerNotes } : {}),
    ...(mood !== undefined ? { mood } : {}),
  };
  const { resource } = await meetingsContainer.item(params.id, params.id).replace<Meeting>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}
