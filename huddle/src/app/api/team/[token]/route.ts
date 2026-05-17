export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { teamSettingsContainer, retrosContainer } from "@/lib/cosmos";
import type { TeamSettings, Retro } from "@/types";

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  // Resolve team token → managerId
  const { resources: settings } = await teamSettingsContainer.items
    .query<TeamSettings>({
      query: "SELECT * FROM c WHERE c.teamToken = @token",
      parameters: [{ name: "@token", value: params.token }],
    })
    .fetchAll();

  const setting = settings[0];
  if (!setting) return Response.json({ error: "Not found" }, { status: 404 });

  const { resources: retros } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.managerId = @mid ORDER BY c.createdAt DESC",
      parameters: [{ name: "@mid", value: setting.id }],
    })
    .fetchAll();

  return Response.json(retros);
}
