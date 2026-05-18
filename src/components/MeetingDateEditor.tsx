"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  meetingId: string;
  meetingDate: string;
  isManager: boolean;
  completed: boolean;
}

export default function MeetingDateEditor({ meetingId, meetingDate, isManager, completed }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(meetingDate);
  const [saving, setSaving] = useState(false);

  const label = new Date(meetingDate).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  async function save() {
    if (!draft || draft === meetingDate) { setEditing(false); return; }
    setSaving(true);
    await fetch(`/api/meetings/${meetingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingDate: draft }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          type="date"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          onClick={save}
          disabled={saving}
          className="text-sm px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={() => { setDraft(meetingDate); setEditing(false); }} className="text-sm text-gray-400 hover:text-gray-700 transition">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <p className="text-sm text-gray-500">{label}</p>
      {isManager && !completed && (
        <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-gray-700 transition">
          Edit
        </button>
      )}
    </div>
  );
}
