"use client";

import { useState } from "react";
import type { Employee } from "@/types";

export default function AddEmployeeForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "biweekly">("weekly");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Employee | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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
      const employee: Employee = await res.json();
      setName("");
      setCreated(employee);
    }
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  if (created) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${baseUrl}/huddle/${created.token}`;

    return (
      <div className="bg-cbre-green-light border border-cbre-mint rounded-xl p-4 flex flex-col gap-3 max-w-lg">
        <p className="text-sm font-semibold text-cbre-green">{created.name} added</p>
        <div>
          <p className="text-xs text-gray-600 mb-1">Share this link with {created.name}</p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 min-w-0 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 truncate text-gray-700">
              {link}
            </code>
            <button
              onClick={() => copyLink(link)}
              className="shrink-0 text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition text-gray-600"
            >
              {linkCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          This link is unique to {created.name} — remind them not to share it.
        </p>
        <button
          onClick={() => { setCreated(null); setOpen(false); window.location.reload(); }}
          className="text-sm text-gray-500 hover:text-gray-900 transition w-fit"
        >
          Done
        </button>
      </div>
    );
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
