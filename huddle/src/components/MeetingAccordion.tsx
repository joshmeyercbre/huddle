"use client";
import { useState } from "react";
import type { Meeting, ActionItem, Topic, TopicTag } from "@/types";

const TAG_CLASSES: Record<TopicTag, string> = {
  feedback: "bg-amber-100 text-amber-800",
  decision: "bg-red-100 text-red-800",
  fyi:      "bg-sky-100 text-sky-800",
  career:   "bg-purple-100 text-purple-800",
};
const TAG_LABELS: Record<TopicTag, string> = {
  feedback: "Feedback",
  decision: "Decision",
  fyi:      "FYI",
  career:   "Career",
};

function normalizeTopic(t: string | Topic): Topic {
  return typeof t === "string" ? { text: t } : t;
}

interface Props {
  meeting: Meeting;
  actionItems: ActionItem[];
}

export default function MeetingAccordion({ meeting, actionItems }: Props) {
  const [open, setOpen] = useState(false);

  const dateLabel = new Date(meeting.meetingDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="text-sm font-medium text-gray-800">{dateLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          {meeting.sections.whatsOnYourMind.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What&apos;s on your mind</p>
              <ul className="space-y-1">
                {meeting.sections.whatsOnYourMind.map((t, i) => {
                  const topic = normalizeTopic(t);
                  return (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 select-none">•</span>
                      <span className="flex-1 text-gray-700">{topic.text}</span>
                      {topic.tag && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TAG_CLASSES[topic.tag]}`}>
                          {TAG_LABELS[topic.tag]}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {meeting.sections.winOfWeek && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Win of the week</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.sections.winOfWeek}</p>
            </div>
          )}

          {meeting.sections.workingOn && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">What are you working on?</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.sections.workingOn}</p>
            </div>
          )}

          {meeting.sections.blockers && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Blockers, priorities, follow-ups</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.sections.blockers}</p>
            </div>
          )}

          {actionItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Action items</p>
              <ul className="space-y-2">
                {actionItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    <span className={`flex-1 ${item.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{item.text}</span>
                    <span className="text-xs text-gray-400">{item.assignee === "manager" ? "You" : "Employee"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
