"use client";
import { useRef, useState } from "react";
import type { Meeting, ActionItem, MeetingSections } from "@/types";
import TopicList from "@/components/TopicList";
import SectionCard from "@/components/SectionCard";
import ActionItemList from "@/components/ActionItemList";
import MeetingAccordion from "@/components/MeetingAccordion";

interface Props {
  meeting: Meeting;
  actionItems: ActionItem[];
  employeeId: string;
  employeeName: string;
  pastMeetings: { meeting: Meeting; actionItems: ActionItem[] }[];
  prepMode?: boolean;
}

export default function MeetingEditor({ meeting, actionItems: initialItems, employeeId, employeeName, pastMeetings, prepMode }: Props) {
  const [sections, setSections] = useState<MeetingSections>(meeting.sections);
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const saveTimers = useRef<Partial<Record<keyof MeetingSections, NodeJS.Timeout>>>({});

  function handleSectionChange(field: keyof Omit<MeetingSections, "whatsOnYourMind">, value: string) {
    const updated = { ...sections, [field]: value };
    setSections(updated);
    clearTimeout(saveTimers.current[field]);
    saveTimers.current[field] = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
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

  function handleToggle(id: string, completed: boolean) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, completed } : i));
  }

  function handleAddItem(item: ActionItem) {
    setItems((prev) => [...prev, item]);
  }

  const meetingLabel = new Date(meeting.meetingDate).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-4">
      {prepMode && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
          <p className="text-sm font-medium text-blue-900">Upcoming 1-on-1 — {meetingLabel}</p>
          <p className="text-sm text-blue-700 mt-0.5">Add your topics and notes below before the meeting starts.</p>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What&apos;s on your mind?</p>
        <TopicList topics={sections.whatsOnYourMind} meetingId={meeting.id} onChange={handleTopicsChange} />
      </div>

      <SectionCard
        label="Win of the week"
        value={sections.winOfWeek}
        onChange={(v) => handleSectionChange("winOfWeek", v)}
        placeholder="What's one thing you're proud of since we last met?"
      />

      <SectionCard
        label="What are you working on?"
        value={sections.workingOn}
        onChange={(v) => handleSectionChange("workingOn", v)}
        placeholder="Blockers, priorities, current focus…"
      />

      <SectionCard
        label="Blockers, priorities, follow-ups"
        value={sections.blockers}
        onChange={(v) => handleSectionChange("blockers", v)}
        placeholder="Anything blocking you or needing follow-up?"
      />

      <ActionItemList
        items={items}
        meetingId={meeting.id}
        employeeId={employeeId}
        employeeName={employeeName}
        onToggle={handleToggle}
        onAdd={handleAddItem}
        hideAdd={prepMode}
      />

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
