"use client";
import { useState } from "react";

interface Props {
  topics: string[];
  meetingId: string;
  onChange: (topics: string[]) => void;
}

export default function TopicList(props: Props) {
  const { topics, onChange } = props;
  const [draft, setDraft] = useState("");

  function addTopic() {
    if (!draft.trim()) return;
    onChange([...topics, draft.trim()]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      {topics.map((topic, i) => (
        <p key={i} className="text-sm text-gray-800 flex items-start gap-2">
          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-cbre-mint shrink-0" />
          {topic}
        </p>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
          placeholder="Add a topic…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cbre-mint"
        />
        <button
          onClick={addTopic}
          className="text-sm px-3 py-1.5 bg-cbre-green text-white rounded-lg hover:bg-cbre-mint hover:text-cbre-green transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
