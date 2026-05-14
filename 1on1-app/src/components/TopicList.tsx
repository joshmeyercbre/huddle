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
        <p key={i} className="text-sm text-gray-800 before:content-['•'] before:mr-2 before:text-gray-400">{topic}</p>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
          placeholder="Add a topic…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          onClick={addTopic}
          className="text-sm px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-gray-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}
