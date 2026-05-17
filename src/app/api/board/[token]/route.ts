export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retrosContainer, retroItemsContainer } from "@/lib/cosmos";
import { requireAuth, getManagerId } from "@/lib/auth";
import type { Retro, RetroItem } from "@/types";

async function getRetroByToken(token: string): Promise<Retro | null> {
  const { resources } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.token = @token",
      parameters: [{ name: "@token", value: token }],
    })
    .fetchAll();
  return resources[0] ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const retro = await getRetroByToken(params.token);
  if (!retro) return Response.json({ error: "Not found" }, { status: 404 });

  const { resources: items } = await retroItemsContainer.items
    .query<RetroItem>({
      query: "SELECT * FROM c WHERE c.retroId = @rid",
      parameters: [{ name: "@rid", value: retro.id }],
    })
    .fetchAll();

  return Response.json({
    items,
    timerEndsAt: retro.timerEndsAt ?? null,
    timerDurationMs: retro.timerDurationMs ?? null,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
  // Timer control is manager-only
  const authError = requireAuth(req);
  if (authError) return authError;

  const retro = await getRetroByToken(params.token);
  if (!retro) return Response.json({ error: "Not found" }, { status: 404 });

  // Ensure the authenticated manager owns this retro
  const managerId = getManagerId(req);
  if (managerId && retro.managerId !== managerId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as { timerEndsAt?: unknown; timerDurationMs?: unknown };
  if (body.timerEndsAt !== null && body.timerEndsAt !== undefined && typeof body.timerEndsAt !== "string") {
    return Response.json({ error: "Invalid timerEndsAt" }, { status: 400 });
  }

  const updated: Retro = { ...retro };
  if (body.timerEndsAt === null) {
    delete updated.timerEndsAt;
    delete updated.timerDurationMs;
  } else if (typeof body.timerEndsAt === "string") {
    updated.timerEndsAt = body.timerEndsAt;
    if (typeof body.timerDurationMs === "number") updated.timerDurationMs = body.timerDurationMs;
  }

  const { resource } = await retrosContainer.item(retro.id, retro.id).replace<Retro>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json({
    timerEndsAt: resource.timerEndsAt ?? null,
    timerDurationMs: resource.timerDurationMs ?? null,
  });
}
