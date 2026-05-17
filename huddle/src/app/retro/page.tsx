export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import Link from "next/link";
import { retrosContainer } from "@/lib/cosmos";
import { getManagerIdFromHeader } from "@/lib/auth";
import type { Retro } from "@/types";
import { getFormat } from "@/lib/retro-formats";
import CreateRetroForm from "@/components/CreateRetroForm";
import CopyButtonClient from "@/components/CopyButtonClient";

async function getRetros(managerId: string): Promise<Retro[]> {
  const { resources } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.managerId = @mid ORDER BY c.createdAt DESC",
      parameters: [{ name: "@mid", value: managerId }],
    })
    .fetchAll();
  return resources;
}

export default async function RetroPage() {
  const managerId = getManagerIdFromHeader(headers().get("x-ms-client-principal"));
  const retros = await getRetros(managerId);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-cbre-green px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-8 bg-cbre-mint rounded-sm" />
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="text-xl font-bold text-white tracking-tight">Huddle</Link>
          <span className="text-white/40">|</span>
          <span className="text-white font-medium">Retrospectives</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-cbre-green mb-4">New Retrospective</h2>
          <CreateRetroForm />
        </div>

        {retros.length === 0 ? (
          <p className="text-gray-500 text-sm">No retrospectives yet. Create one above.</p>
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
                  <CopyButtonClient url={`${baseUrl}/retro/${retro.token}`} />
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
