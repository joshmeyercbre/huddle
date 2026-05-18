"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RETRO_FORMATS } from "@/lib/retro-formats";
import type { RetroFormat } from "@/types";

export default function CreateRetroForm() {
  const router = useRouter();
  const [sprintName, setSprintName] = useState("");
  const [format, setFormat] = useState<RetroFormat>("classic");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sprintName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/retros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprintName: sprintName.trim(), format }),
      });
      if (res.ok) {
        const retro = await res.json();
        router.push(`/retro/${retro.token}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Sprint name (e.g. Sprint 42)"
        value={sprintName}
        onChange={(e) => setSprintName(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cbre-mint focus:border-transparent"
        required
      />

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Format</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {RETRO_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                format === f.id
                  ? "border-cbre-mint bg-cbre-mint-light ring-1 ring-cbre-mint"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <p className={`text-sm font-medium ${format === f.id ? "text-cbre-green" : "text-gray-800"}`}>
                {f.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !sprintName.trim()}
          className="bg-cbre-green text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "Creating…" : "Create & Open Board"}
        </button>
      </div>
    </form>
  );
}
