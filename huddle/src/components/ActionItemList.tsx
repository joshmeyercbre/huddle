"use client";
import { useState } from "react";
import type { ActionItem } from "@/types";

interface Props {
  items: ActionItem[];
  meetingId: string;
  employeeId: string;
  employeeName: string;
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (item: ActionItem) => void;
}

export default function ActionItemList({ items, meetingId, employeeId, employeeName, onToggle, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [assignee, setAssignee] = useState<"manager" | "employee">("employee");
  const [saving, setSaving] = useState(false);

  const carried = items.filter((i) => i.carriedOver);
  const current = items.filter((i) => !i.carriedOver);

  async function addItem() {
    if (!text.trim()) return;
    setSaving(true);
    const res = await fetch("/api/action-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, employeeId, text: text.trim(), assignee }),
    });
    if (res.ok) {
      const newItem: ActionItem = await res.json();
      onAdd(newItem);
      setText("");
      setShowForm(false);
    }
    setSaving(false);
  }

  async function toggle(item: ActionItem) {
    const res = await fetch(`/api/action-items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    });
    if (res.ok) {
      onToggle(item.id, !item.completed);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Actions from this meeting</p>

      {carried.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-700 mb-2">Carried over from last time</p>
          {carried.map((item) => <ActionRow key={item.id} item={item} employeeName={employeeName} onToggle={() => toggle(item)} />)}
        </div>
      )}

      <div className="space-y-2">
        {current.map((item) => (
          <ActionRow key={item.id} item={item} employeeName={employeeName} onToggle={() => toggle(item)} />
        ))}
      </div>

      {showForm ? (
        <div className="mt-4 flex flex-col gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Action item…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <div className="flex gap-2 items-center">
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value as "manager" | "employee")}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            >
              <option value="employee">{employeeName}</option>
              <option value="manager">You</option>
            </select>
            <button onClick={addItem} disabled={saving || !text.trim()} className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          + Add action
        </button>
      )}
    </div>
  );
}

function ActionRow({ item, employeeName, onToggle }: { item: ActionItem; employeeName: string; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
      />
      <span className={`flex-1 text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-800"}`}>{item.text}</span>
      <span className="text-xs text-gray-400">{item.assignee === "manager" ? "You" : employeeName}</span>
    </div>
  );
}
