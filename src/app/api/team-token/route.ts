export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { teamSettingsContainer } from "@/lib/cosmos";
import { requireAuth, getManagerId } from "@/lib/auth";
import type { TeamSettings } from "@/types";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const managerId = getManagerId(req);

  // Return existing token or create one
  const { resource: existing } = await teamSettingsContainer.item(managerId, managerId).read<TeamSettings>();
  if (existing) return Response.json({ teamToken: existing.teamToken });

  const settings: TeamSettings = { id: managerId, teamToken: crypto.randomUUID() };
  const { resource } = await teamSettingsContainer.items.create<TeamSettings>(settings);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  return Response.json({ teamToken: resource.teamToken });
}
