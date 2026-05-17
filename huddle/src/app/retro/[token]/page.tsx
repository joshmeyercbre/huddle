export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { retrosContainer, retroItemsContainer } from "@/lib/cosmos";
import type { Retro, RetroItem } from "@/types";
import RetroBoard from "@/components/RetroBoard";

async function getRetroByToken(token: string): Promise<Retro | null> {
  const { resources } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.token = @token",
      parameters: [{ name: "@token", value: token }],
    })
    .fetchAll();
  return resources[0] ?? null;
}

async function getRetroItems(retroId: string): Promise<RetroItem[]> {
  const { resources } = await retroItemsContainer.items
    .query<RetroItem>({
      query: "SELECT * FROM c WHERE c.retroId = @rid",
      parameters: [{ name: "@rid", value: retroId }],
    })
    .fetchAll();
  const sorted = resources.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  console.log("[board] getRetroItems retroId:", retroId, "count:", sorted.length, "actions:", sorted.filter(i => i.isAction).length);
  return sorted;
}

export default async function RetroBoardPage({ params }: { params: { token: string } }) {
  const retro = await getRetroByToken(params.token);
  if (!retro) notFound();

  console.log("[board] loading retro id:", retro.id, "token:", params.token);
  const items = await getRetroItems(retro.id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-cbre-green px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-8 bg-cbre-mint rounded-sm" />
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="text-xl font-bold text-white tracking-tight">Huddle</Link>
          <span className="text-white/40">|</span>
          <span className="text-white font-medium">{retro.sprintName}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${retro.status === "open" ? "bg-cbre-mint text-cbre-green" : "bg-white/20 text-white/70"}`}>
          {retro.status === "open" ? "Open" : "Closed"}
        </span>
      </header>

      <main className="flex-1 px-6 py-8">
        <RetroBoard retro={retro} initialItems={items} />
      </main>
    </div>
  );
}
