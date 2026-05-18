export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retrosContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Retro } from "@/types";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as { status: "open" | "closed" };
  const { resource: existing } = await retrosContainer.item(params.id, params.id).read<Retro>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated = { ...existing, status: body.status };
  const { resource } = await retrosContainer.item(params.id, params.id).replace<Retro>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}
