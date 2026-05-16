"use client";
import { useState } from "react";
import type { Topic, TopicTag } from "@/types";

const TAG_OPTIONS: { value: TopicTag; label: string; className: string }[] = [
  { value: "feedback", label: "Feedback",  className: "bg-amber-100 text-amber-800" },
  { value: "decision", label: "Decision",  className: "bg-red-100 text-red-800" },
  { value: "fyi",      label: "FYI",       className: "bg-sky-100 text-sky-800" },
  { value: "career",   label: "Career",    className: "bg-purple-100 text-purple-800" },
];

function normalize(t: string | Topic): Topic {
  return typeof t === "string" ? { text: t } : t;
}

interface Props {
  topics: (string | Topic)[];
  meetingId: string;
  onChange: (topics: Topic[]) => void;
  readOnly?: boolean;
}

export default function TopicList({ topics, onChange, readOnly }: Props) {
  const [draft, setDraft] = useState("");
  const [draftTag, setDraftTag] = useState<TopicTag | "">("");

  const normalized = topics.map(normalize);

  function addTopic() {
    if (!draft.trim()) return;
    const topic: Topic = { text: draft.trim(), ...(draftTag ? { tag: draftTag } : {}) };
    onChange([...normalized, topic]);
    setDraft("");
    setDraftTag("");
  }

  return (
    <div className="space-y-2">
      {normalized.map((topic, i) => {
        const tagOption = topic.tag ? TAG_OPTIONS.find((o) => o.value === topic.tag) : null;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-gray-400 text-sm select-none">•</span>
            <span className="text-sm text-gray-800 flex-1">{topic.text}</span>
            {tagOption && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${tagOption.className}`}>
                {tagOption.label}
              </span>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <div className="flex gap-2 mt-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
            placeholder="Add a topic…"
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <select
            value={draftTag}
            onChange={(e) => setDraftTag(e.target.value as TopicTag | "")}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="">No tag</option>
            {TAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={addTopic}
            className="text-sm px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-gray-700 shrink-0"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
