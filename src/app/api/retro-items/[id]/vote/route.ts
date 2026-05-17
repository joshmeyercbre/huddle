export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retroItemsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { RetroItem } from "@/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as { delta?: unknown };
  if (body.delta !== 1 && body.delta !== -1) {
    return Response.json({ error: "delta must be 1 or -1" }, { status: 400 });
  }

  const { resource: existing } = await retroItemsContainer.item(params.id, params.id).read<RetroItem>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated = { ...existing, votes: Math.max(0, existing.votes + body.delta) };
  const { resource } = await retroItemsContainer.item(params.id, params.id).replace<RetroItem>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}
