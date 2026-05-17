export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retroItemsContainer } from "@/lib/cosmos";
import type { RetroItem } from "@/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json() as { delta: 1 | -1 };
  const { resource: existing } = await retroItemsContainer.item(params.id, params.id).read<RetroItem>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated = { ...existing, votes: Math.max(0, existing.votes + body.delta) };
  const { resource } = await retroItemsContainer.item(params.id, params.id).replace<RetroItem>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}
