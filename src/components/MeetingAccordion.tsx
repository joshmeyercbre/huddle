"use client";
import { useState } from "react";
import type { Meeting, ActionItem } from "@/types";

interface Props {
  meeting: Meeting;
  actionItems: ActionItem[];
}

export default function MeetingAccordion({ meeting, actionItems }: Props) {
  const [open, setOpen] = useState(false);
  const s = meeting.sections;

  const dateLabel = new Date(meeting.meetingDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusLabel = meeting.managerShared ? "Reviewed" : meeting.submitted ? "Ready" : "In progress";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <div>
          <span className="text-sm font-medium text-gray-800">
            {meeting.number ? `#${meeting.number} · ` : ""}{dateLabel}
          </span>
          <span className="block text-xs text-gray-400 mt-0.5">{statusLabel}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          {s.whatsOnYourMind.length > 0 && (
            <Field label="What's on your mind">
              <ul className="space-y-1">
                {s.whatsOnYourMind.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 select-none">•</span>
                    <span className="flex-1 text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
            </Field>
          )}
          {s.workingOn && <Field label="Working on">{s.workingOn}</Field>}
          {s.blockers && <Field label="Blockers">{s.blockers}</Field>}
          {s.growthFocus && <Field label="Growth focus">{s.growthFocus}</Field>}
          {s.supportNeeded && <Field label="Support needed">{s.supportNeeded}</Field>}
          {s.feedbackForManager && <Field label="Feedback for manager">{s.feedbackForManager}</Field>}
          {s.wantFeedbackOn && <Field label="Wants feedback on">{s.wantFeedbackOn}</Field>}

          {(s.goingWellManager || s.areaToFocusManager) && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">Manager Feedback</p>
              {s.goingWellManager && <Field label="What's going well">{s.goingWellManager}</Field>}
              {s.areaToFocusManager && <Field label="One area to focus on">{s.areaToFocusManager}</Field>}
              {s.feedbackForManagerResponse && <Field label="Response to feedback">{s.feedbackForManagerResponse}</Field>}
              {s.wantFeedbackOnResponse && <Field label="Feedback provided">{s.wantFeedbackOnResponse}</Field>}
            </div>
          )}

          {actionItems.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      {typeof children === "string"
        ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{children}</p>
        : children}
    </div>
  );
}
