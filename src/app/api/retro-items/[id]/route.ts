export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retroItemsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { RetroItem } from "@/types";

const VALID_PRIORITIES = ["high", "medium", "low"] as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as { isAction?: unknown; completedAction?: unknown; priority?: unknown };

  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority as (typeof VALID_PRIORITIES)[number])) {
    return Response.json({ error: "Invalid priority" }, { status: 400 });
  }

  const { resource: existing } = await retroItemsContainer.item(params.id, params.id).read<RetroItem>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated = {
    ...existing,
    ...(typeof body.isAction === "boolean" ? { isAction: body.isAction } : {}),
    ...(typeof body.completedAction === "boolean" ? { completedAction: body.completedAction } : {}),
    ...(body.priority !== undefined ? { priority: body.priority as RetroItem["priority"] } : {}),
  };
  const { resource } = await retroItemsContainer.item(params.id, params.id).replace<RetroItem>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}
