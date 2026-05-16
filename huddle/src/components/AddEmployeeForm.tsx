"use client";
import { useState } from "react";

export default function AddEmployeeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "biweekly">("weekly");
  const [notifyDaysBefore, setNotifyDaysBefore] = useState<0 | 1>(1);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, cadence, notifyDaysBefore }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setEmail("");
      window.location.reload();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Employee name"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="employee@company.com"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Cadence</label>
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value as "weekly" | "biweekly")}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Notify</label>
        <select
          value={notifyDaysBefore}
          onChange={(e) => setNotifyDaysBefore(Number(e.target.value) as 0 | 1)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value={1}>Day before</option>
          <option value={0}>Morning of</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-700 transition disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add Employee"}
      </button>
    </form>
  );
}
