import { NextRequest } from "next/server";
import { meetingsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
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
  const body = await req.json() as Partial<MeetingSections>;
  const { resource: existing } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: Meeting = { ...existing, sections: { ...existing.sections, ...body } };
  const { resource } = await meetingsContainer.item(params.id, params.id).replace<Meeting>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}
