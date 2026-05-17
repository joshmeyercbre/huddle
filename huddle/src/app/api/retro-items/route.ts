export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retroItemsContainer } from "@/lib/cosmos";
import type { RetroItem } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json() as { retroId: string; category: string; text: string; authorName: string };
  const item: RetroItem = {
    id: crypto.randomUUID(),
    retroId: body.retroId,
    category: body.category,
    text: body.text,
    authorName: body.authorName,
    votes: 0,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await retroItemsContainer.items.create<RetroItem>(item);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource, { status: 201 });
}
