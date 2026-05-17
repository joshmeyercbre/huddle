"use client";
import { useState } from "react";

const OPTIONS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: "😞", label: "Rough" },
  { value: 2, emoji: "😟", label: "Tough" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

interface Props {
  meetingId: string;
  initial?: 1 | 2 | 3 | 4 | 5;
  readOnly?: boolean;
}

export default function SentimentPicker({ meetingId, initial, readOnly }: Props) {
  const [value, setValue] = useState<1 | 2 | 3 | 4 | 5 | undefined>(initial);

  async function pick(next: 1 | 2 | 3 | 4 | 5) {
    if (readOnly) return;
    setValue(next);
    await fetch(`/api/meetings/${meetingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentiment: next }),
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">How are you feeling?</p>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => pick(opt.value)}
            disabled={readOnly}
            title={opt.label}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition text-xl
              ${value === opt.value
                ? "border-gray-400 bg-gray-100"
                : "border-transparent hover:border-gray-200 hover:bg-gray-50"}
              ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          >
            {opt.emoji}
            <span className="text-xs text-gray-400">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
