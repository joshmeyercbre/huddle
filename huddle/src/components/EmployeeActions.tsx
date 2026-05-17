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
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

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

  async function sendLink() {
    setSendingLink(true);
    await fetch(`/api/employees/${employee.id}/send-link`, { method: "POST" });
    setSendingLink(false);
    setLinkSent(true);
    setTimeout(() => setLinkSent(false), 4000);
  }

  async function regenerateLink() {
    setRegenerating(true);
    await fetch(`/api/employees/${employee.id}/regenerate-token`, { method: "POST" });
    setRegenerating(false);
    setShowRegenerateConfirm(false);
    router.refresh();
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

  if (showRegenerateConfirm) {
    return (
      <div className="flex flex-col gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm">
        <p className="text-sm font-medium text-amber-900">Generate a new link for {employee.name}?</p>
        <p className="text-xs text-amber-700">
          Their current link will stop working immediately. Use this if the link has been shared or compromised.
          You should send them the new link afterwards.
        </p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={regenerateLink}
            disabled={regenerating}
            className="text-sm px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            {regenerating ? "Regenerating…" : "Yes, generate new link"}
          </button>
          <button
            onClick={() => setShowRegenerateConfirm(false)}
            className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-900 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mt-3">
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-gray-400 hover:text-gray-700 transition"
      >
        Edit
      </button>
      {employee.email && (
        <button
          onClick={sendLink}
          disabled={sendingLink || linkSent}
          className="text-sm text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
        >
          {linkSent ? "Link sent!" : sendingLink ? "Sending…" : "Send link"}
        </button>
      )}
      <button
        onClick={() => setShowRegenerateConfirm(true)}
        className="text-sm text-gray-400 hover:text-gray-700 transition"
      >
        New link
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
