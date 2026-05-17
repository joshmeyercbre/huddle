export const dynamic = "force-dynamic";

import Link from "next/link";
import { teamSettingsContainer, retrosContainer } from "@/lib/cosmos";
import type { TeamSettings, Retro } from "@/types";
import { getFormat } from "@/lib/retro-formats";
import { notFound } from "next/navigation";

async function getTeamRetros(token: string): Promise<{ retros: Retro[] } | null> {
  const { resources: settings } = await teamSettingsContainer.items
    .query<TeamSettings>({
      query: "SELECT * FROM c WHERE c.teamToken = @token",
      parameters: [{ name: "@token", value: token }],
    })
    .fetchAll();

  const setting = settings[0];
  if (!setting) return null;

  const { resources: retros } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.managerId = @mid ORDER BY c.createdAt DESC",
      parameters: [{ name: "@mid", value: setting.id }],
    })
    .fetchAll();

  return { retros };
}

export default async function TeamRetrosPage({ params }: { params: { token: string } }) {
  const data = await getTeamRetros(params.token);
  if (!data) notFound();

  const { retros } = data;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-cbre-green px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-8 bg-cbre-mint rounded-sm" />
        <h1 className="text-xl font-bold text-white tracking-tight">Huddle</h1>
        <span className="text-white/40">|</span>
        <span className="text-white font-medium">Team Retrospectives</span>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 py-10 flex-1">
        {retros.length === 0 ? (
          <p className="text-gray-500 text-sm">No retrospectives yet.</p>
        ) : (
          <div className="space-y-3">
            {retros.map((retro) => (
              <div key={retro.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between hover:border-cbre-mint transition-colors">
                <div>
                  <p className="font-semibold text-cbre-green">{retro.sprintName}</p>
                  <p className="text-sm text-gray-500">
                    {getFormat(retro.format).label} · {new Date(retro.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${retro.status === "open" ? "bg-cbre-mint-light text-cbre-green border border-cbre-mint" : "bg-gray-100 text-gray-500"}`}>
                    {retro.status === "open" ? "Open" : "Closed"}
                  </span>
                  <Link
                    href={`/retro/${retro.token}`}
                    className="text-sm font-medium bg-cbre-green text-white px-4 py-1.5 rounded-lg hover:bg-cbre-mint hover:text-cbre-green transition-colors"
                  >
                    Open Board
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
