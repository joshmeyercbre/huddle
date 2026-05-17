export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retroItemsContainer, retrosContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { RetroItem, Retro } from "@/types";

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as { retroId?: string; category?: string; text?: string; authorName?: string };
  if (!body.retroId || !body.category || !body.text?.trim()) {
    return Response.json({ error: "retroId, category, and text are required" }, { status: 400 });
  }

  // Verify the retro exists
  const { resource: retro } = await retrosContainer.item(body.retroId, body.retroId).read<Retro>();
  if (!retro) return Response.json({ error: "Retro not found" }, { status: 404 });

  const item: RetroItem = {
    id: crypto.randomUUID(),
    retroId: body.retroId,
    category: body.category,
    text: body.text.trim(),
    authorName: (body.authorName ?? "").trim().slice(0, 100) || "Anonymous",
    votes: 0,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await retroItemsContainer.items.create<RetroItem>(item);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource, { status: 201 });
}
