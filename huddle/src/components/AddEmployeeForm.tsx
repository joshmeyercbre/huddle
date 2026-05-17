"use client";

import { useState } from "react";

export default function AddEmployeeForm({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "biweekly">("weekly");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), cadence }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setOpen(false);
      onAdded?.();
      window.location.reload();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-cbre-green transition-colors"
      >
        <span className="text-lg leading-none">+</span> Add member
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        autoFocus
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cbre-mint"
      />
      <select
        value={cadence}
        onChange={(e) => setCadence(e.target.value as "weekly" | "biweekly")}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cbre-mint"
      >
        <option value="weekly">Weekly</option>
        <option value="biweekly">Bi-weekly</option>
      </select>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="bg-cbre-green text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
        Cancel
      </button>
    </form>
  );
}
