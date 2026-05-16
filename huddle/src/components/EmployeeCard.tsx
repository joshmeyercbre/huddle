"use client";
import { useState } from "react";
import Link from "next/link";
import type { Employee, Meeting, MeetingType, Topic } from "@/types";

function hasPrepped(meeting: Meeting): boolean {
  const s = meeting.sections;
  return (
    (s.whatsOnYourMind?.length ?? 0) > 0 ||
    !!s.winOfWeek?.trim() ||
    !!s.workingOn?.trim() ||
    !!s.blockers?.trim() ||
    meeting.sentiment !== undefined
  );
}

interface Props {
  employee: Employee;
  lastMeeting: Meeting | null;
  nextMeeting: Meeting | null;
}

export default function EmployeeCard({ employee, lastMeeting, nextMeeting }: Props) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [meetingType, setMeetingType] = useState<MeetingType>("standard");
  const [topicDraft, setTopicDraft] = useState("");
  const [topicSaved, setTopicSaved] = useState(false);
  const [savingTopic, setSavingTopic] = useState(false);
  const [savedTopics, setSavedTopics] = useState<Topic[]>(
    (nextMeeting?.sections.whatsOnYourMind ?? []).map((t) =>
      typeof t === "string" ? { text: t } : t
    )
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const employeeUrl = `${baseUrl}/huddle/${employee.token}`;

  async function startMeeting() {
    setStarting(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: employee.id,
        meetingDate: new Date().toISOString().slice(0, 10),
        type: meetingType,
      }),
    });
    setStarting(false);
    if (res.ok) window.location.reload();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(employeeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  async function saveTopic() {
    if (!topicDraft.trim() || !nextMeeting) return;
    setSavingTopic(true);
    const updated = [...savedTopics, { text: topicDraft.trim() }];
    await fetch(`/api/meetings/${nextMeeting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsOnYourMind: updated }),
    });
    setSavedTopics(updated);
    setSavingTopic(false);
    setTopicDraft("");
    setTopicSaved(true);
    setTimeout(() => setTopicSaved(false), 2500);
  }

  const nextDate = nextMeeting
    ? new Date(nextMeeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/employee/${employee.id}`} className="font-semibold text-gray-900 hover:underline">
            {employee.name}
          </Link>
          <p className="text-sm text-gray-500 capitalize">{employee.cadence}</p>
        </div>
        <button
          onClick={copyLink}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-400 transition"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {lastMeeting
          ? `Last meeting: ${new Date(lastMeeting.meetingDate).toLocaleDateString()}`
          : "No meetings yet"}
      </p>

      {nextMeeting && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-gray-400">Save topic for {nextDate}</p>
            {hasPrepped(nextMeeting) ? (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Prepped
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                Not yet
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={topicDraft}
              onChange={(e) => setTopicDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), saveTopic())}
              placeholder="Note something to discuss…"
              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              onClick={saveTopic}
              disabled={savingTopic || !topicDraft.trim()}
              className="text-sm px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-gray-700 disabled:opacity-40 shrink-0"
            >
              {topicSaved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <select
          value={meetingType}
          onChange={(e) => setMeetingType(e.target.value as MeetingType)}
          className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="standard">1-on-1</option>
          <option value="quarterly">Quarterly review</option>
          <option value="onboarding">Onboarding</option>
        </select>
        <button
          onClick={startMeeting}
          disabled={starting}
          className="flex-1 bg-gray-900 text-white text-sm font-medium rounded-lg py-2 hover:bg-gray-700 transition disabled:opacity-50"
        >
          {starting ? "Starting…" : "Start Meeting"}
        </button>
      </div>
    </div>
  );
}
