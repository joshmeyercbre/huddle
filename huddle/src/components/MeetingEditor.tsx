"use client";
import { useRef, useState } from "react";
import type { Meeting, ActionItem, MeetingSections, MeetingType } from "@/types";
import TopicList from "@/components/TopicList";
import SectionCard from "@/components/SectionCard";
import ActionItemList from "@/components/ActionItemList";
import MeetingAccordion from "@/components/MeetingAccordion";
import SentimentPicker from "@/components/SentimentPicker";

type TextSectionDef = {
  kind: "text";
  key: keyof Omit<MeetingSections, "whatsOnYourMind" | "bonusQuestionText" | "bonusQuestionAnswer">;
  label: string;
  placeholder: string;
};
type TopicSectionDef = { kind: "topics"; label: string };
type SectionDef = TextSectionDef | TopicSectionDef;

const TEMPLATES: Record<MeetingType, SectionDef[]> = {
  standard: [
    { kind: "topics", label: "What's on your mind?" },
    { kind: "text", key: "winOfWeek", label: "Win of the week", placeholder: "What's one thing you're proud of since we last met?" },
    { kind: "text", key: "workingOn", label: "What are you working on?", placeholder: "Blockers, priorities, current focus…" },
    { kind: "text", key: "blockers", label: "Blockers, priorities, follow-ups", placeholder: "Anything blocking you or needing follow-up?" },
  ],
  quarterly: [
    { kind: "text", key: "winsThisQuarter", label: "Wins this quarter", placeholder: "What went well?" },
    { kind: "text", key: "goalsReview", label: "Goals review", placeholder: "How did you track against your goals?" },
    { kind: "text", key: "careerDevelopment", label: "Career development", placeholder: "What skills or growth areas are top of mind?" },
    { kind: "text", key: "nextQuarterPriorities", label: "Next quarter priorities", placeholder: "What are you focusing on next?" },
  ],
  onboarding: [
    { kind: "text", key: "howIsItGoing", label: "How's it going so far?", placeholder: "General impressions, adjustment, feelings…" },
    { kind: "text", key: "whatIsWorkingWell", label: "What's working well?", placeholder: "Things that are going smoothly" },
    { kind: "text", key: "whatIsUnclear", label: "What's unclear or confusing?", placeholder: "Processes, expectations, tools…" },
    { kind: "text", key: "whatDoYouNeed", label: "What do you need from me?", placeholder: "Support, clarity, resources…" },
  ],
};

const TYPE_LABELS: Record<MeetingType, string> = {
  standard: "1-on-1",
  quarterly: "Quarterly review",
  onboarding: "Onboarding check-in",
};

interface Props {
  meeting: Meeting;
  actionItems: ActionItem[];
  employeeId: string;
  employeeName: string;
  pastMeetings: { meeting: Meeting; actionItems: ActionItem[] }[];
  prepMode?: boolean;
  showCompleteButton?: boolean;
}

export default function MeetingEditor({
  meeting,
  actionItems: initialItems,
  employeeId,
  employeeName,
  pastMeetings,
  prepMode,
  showCompleteButton,
}: Props) {
  const [sections, setSections] = useState<MeetingSections>(meeting.sections);
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [completedAt, setCompletedAt] = useState<string | undefined>(meeting.completedAt);
  const [completing, setCompleting] = useState(false);
  const saveTimers = useRef<Partial<Record<keyof MeetingSections, NodeJS.Timeout>>>({});

  const type: MeetingType = meeting.type ?? "standard";
  const template = TEMPLATES[type];
  const isCompleted = !!completedAt;

  function handleSectionChange(key: keyof Omit<MeetingSections, "whatsOnYourMind">, value: string) {
    const updated = { ...sections, [key]: value };
    setSections(updated);
    clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    }, 800);
  }

  function handleTopicsChange(topics: string[]) {
    const updated = { ...sections, whatsOnYourMind: topics };
    setSections(updated);
    clearTimeout(saveTimers.current.whatsOnYourMind);
    saveTimers.current.whatsOnYourMind = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsOnYourMind: topics }),
      });
    }, 800);
  }

  async function handleComplete() {
    setCompleting(true);
    const now = new Date().toISOString();
    await fetch(`/api/meetings/${meeting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt: now }),
    });
    setCompletedAt(now);
    setCompleting(false);
  }

  function handleToggle(id: string, completed: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed } : i)));
  }

  function handleAddItem(item: ActionItem) {
    setItems((prev) => [...prev, item]);
  }

  const meetingLabel = new Date(meeting.meetingDate).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-4">
      {type !== "standard" && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{TYPE_LABELS[type]}</p>
      )}

      <SentimentPicker
        meetingId={meeting.id}
        initial={meeting.sentiment}
        readOnly={isCompleted}
      />

      {prepMode && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
          <p className="text-sm font-medium text-blue-900">Upcoming 1-on-1 — {meetingLabel}</p>
          <p className="text-sm text-blue-700 mt-0.5">Add your topics and notes below before the meeting starts.</p>
        </div>
      )}

      {isCompleted && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-3">
          <p className="text-sm text-green-800 font-medium">
            Meeting completed — {new Date(completedAt!).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      )}

      {template.map((section) =>
        section.kind === "topics" ? (
          <div key="whatsOnYourMind" className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{section.label}</p>
            <TopicList
              topics={sections.whatsOnYourMind}
              meetingId={meeting.id}
              onChange={handleTopicsChange}
              readOnly={isCompleted}
            />
          </div>
        ) : (
          <SectionCard
            key={section.key}
            label={section.label}
            value={(sections[section.key] as string | undefined) ?? ""}
            onChange={(v) => handleSectionChange(section.key, v)}
            placeholder={section.placeholder}
            readOnly={isCompleted}
          />
        )
      )}

      {sections.bonusQuestionText && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">This week&rsquo;s question</p>
          <p className="text-sm font-medium text-indigo-900 mb-3">{sections.bonusQuestionText}</p>
          <textarea
            value={sections.bonusQuestionAnswer ?? ""}
            onChange={(e) => handleSectionChange("bonusQuestionAnswer", e.target.value)}
            placeholder="Your thoughts…"
            readOnly={isCompleted}
            rows={3}
            className="w-full text-sm text-gray-800 bg-white border border-indigo-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400 read-only:bg-gray-50 read-only:text-gray-600"
          />
        </div>
      )}

      <ActionItemList
        items={items}
        meetingId={meeting.id}
        employeeId={employeeId}
        employeeName={employeeName}
        onToggle={handleToggle}
        onAdd={handleAddItem}
        hideAdd={prepMode || isCompleted}
      />

      {showCompleteButton && !isCompleted && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50"
        >
          {completing ? "Completing…" : "Complete meeting & send summary"}
        </button>
      )}

      {pastMeetings.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6">Previous meetings</p>
          <div className="space-y-2">
            {pastMeetings.map(({ meeting: m, actionItems: ai }) => (
              <MeetingAccordion key={m.id} meeting={m} actionItems={ai} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
