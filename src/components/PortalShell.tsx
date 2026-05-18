"use client";

import { useState } from "react";
import Link from "next/link";
import type { Retro } from "@/types";
import { getFormat } from "@/lib/retro-formats";

interface Props {
  retros: Retro[];
  children: React.ReactNode; // HuddleViewer
}

export default function PortalShell({ retros, children }: Props) {
  const [tab, setTab] = useState<"meeting" | "retros">("meeting");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* tab bar */}
      <div className="bg-cbre-green/90 px-6 flex gap-1 border-t border-white/10">
        <TabBtn active={tab === "meeting"} onClick={() => setTab("meeting")}>My 1-on-1</TabBtn>
        <TabBtn active={tab === "retros"} onClick={() => setTab("retros")}>
          Team Retros
          {retros.length > 0 && (
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tab === "retros" ? "bg-cbre-mint text-cbre-green" : "bg-white/20 text-white"}`}>
              {retros.length}
            </span>
          )}
        </TabBtn>
      </div>

      {/* meeting tab — always mounted to preserve state */}
      <div className={`flex-1 flex flex-col overflow-hidden ${tab !== "meeting" ? "hidden" : ""}`}>
        {children}
      </div>

      {/* retros tab */}
      {tab === "retros" && (
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8">
          {retros.length === 0 ? (
            <p className="text-sm text-gray-500">No retrospectives yet.</p>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3">
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
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-cbre-mint text-white"
          : "border-transparent text-white/60 hover:text-white/90"
      }`}
    >
      {children}
    </button>
  );
}
