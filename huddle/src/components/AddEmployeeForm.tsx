"use client";
import { useState } from "react";
import type { Employee } from "@/types";

export default function AddEmployeeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "biweekly">("weekly");
  const [notifyDaysBefore, setNotifyDaysBefore] = useState<0 | 1>(1);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Employee | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

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
      const employee: Employee = await res.json();
      setName("");
      setEmail("");
      setCreated(employee);
    }
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  async function sendLink(employeeId: string) {
    setSendingLink(true);
    await fetch(`/api/employees/${employeeId}/send-link`, { method: "POST" });
    setSendingLink(false);
    setLinkSent(true);
  }

  if (created) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
    const link = `${baseUrl}/huddle/${created.token}`;

    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3 max-w-lg">
        <p className="text-sm font-semibold text-green-800">
          {created.name} added successfully
        </p>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Their unique prep link</p>
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

        {created.email && (
          <button
            onClick={() => sendLink(created.id)}
            disabled={sendingLink || linkSent}
            className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 w-fit"
          >
            {linkSent ? "Link sent!" : sendingLink ? "Sending…" : "Send link to employee"}
          </button>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Remind {created.name}:</strong> This link is unique to them — it should not be shared with anyone else.
            If they believe it has been shared or compromised, they should contact you immediately so you can issue a new link.
          </p>
        </div>

        <button
          onClick={() => { setCreated(null); window.location.reload(); }}
          className="text-sm text-gray-500 hover:text-gray-900 transition w-fit"
        >
          Done
        </button>
      </div>
    );
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
