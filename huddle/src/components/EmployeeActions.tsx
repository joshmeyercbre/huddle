"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee } from "@/types";

interface Props {
  employee: Employee;
}

export default function EmployeeActions({ employee }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(employee.name);
  const [cadence, setCadence] = useState(employee.cadence);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), cadence }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Remove ${employee.name} and all their meeting history? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/employees/${employee.id}`, { method: "DELETE" });
    router.push("/");
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value as Employee["cadence"])}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
        </select>
        <button
          onClick={save}
          disabled={saving || !name.trim()}
          className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => { setName(employee.name); setCadence(employee.cadence); setEditing(false); }}
          className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-900 transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-3">
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-gray-400 hover:text-gray-700 transition"
      >
        Edit
      </button>
      <button
        onClick={remove}
        disabled={deleting}
        className="text-sm text-red-400 hover:text-red-600 transition disabled:opacity-50"
      >
        {deleting ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}
