"use client";
import { useRef, useState } from "react";
import type { Meeting, ActionItem, MeetingSections } from "@/types";
import TopicList from "@/components/TopicList";
import SectionCard from "@/components/SectionCard";
import ActionItemList from "@/components/ActionItemList";

interface Props {
  meeting: Meeting;
  actionItems: ActionItem[];
  employeeId: string;
  employeeName: string;
  isManager: boolean;
  reviewMode?: boolean;
  onEnterReview?: () => void;
  onExitReview?: () => void;
}


export default function MeetingEditor({ meeting, actionItems: initialItems, employeeId, employeeName, isManager, reviewMode = false, onEnterReview, onExitReview }: Props) {
  const defaultSections: MeetingSections = {
    whatsOnYourMind: [],
    workingOn: "",
    blockers: "",
    growthFocus: "",
    supportNeeded: "",
    feedbackForManager: "",
    wantFeedbackOn: "",
    goingWellManager: "",
    areaToFocusManager: "",
    feedbackForManagerResponse: "",
    wantFeedbackOnResponse: "",
  };
  const [sections, setSections] = useState<MeetingSections>({ ...defaultSections, ...meeting.sections });
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitted, setSubmitted] = useState(meeting.submitted ?? false);
  const [managerShared, setManagerShared] = useState(meeting.managerShared ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [title, setTitle] = useState(meeting.title ?? "");
  const titleTimer = useRef<NodeJS.Timeout>();
  const [mood, setMood] = useState<Meeting["mood"]>(meeting.mood);

  function handleTitleChange(value: string) {
    setTitle(value);
    clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: value }),
      });
    }, 800);
  }
  const [managerNotes, setManagerNotes] = useState(meeting.managerNotes ?? "");
  const notesTimer = useRef<NodeJS.Timeout>();
  const [starting, setStarting] = useState(false);
  const [startingReview, setStartingReview] = useState(false);
  const [completingReview, setCompletingReview] = useState(false);
  const saveTimers = useRef<Partial<Record<keyof MeetingSections, NodeJS.Timeout>>>({});
  const statusTimer = useRef<NodeJS.Timeout>();

  const filledCount = [
    sections.whatsOnYourMind.length > 0,
    sections.workingOn.trim().length > 0,
    sections.blockers.trim().length > 0,
  ].filter(Boolean).length;

  function markSaving() {
    setSaveStatus("saving");
    clearTimeout(statusTimer.current);
  }

  function markSaved() {
    setSaveStatus("saved");
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
  }

  function handleSectionChange(field: keyof Omit<MeetingSections, "whatsOnYourMind">, value: string) {
    setSections((prev) => ({ ...prev, [field]: value }));
    markSaving();
    clearTimeout(saveTimers.current[field]);
    saveTimers.current[field] = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      }).then(markSaved);
    }, 800);
  }

  function handleTopicsChange(topics: string[]) {
    setSections((prev) => ({ ...prev, whatsOnYourMind: topics }));
    markSaving();
    clearTimeout(saveTimers.current.whatsOnYourMind);
    saveTimers.current.whatsOnYourMind = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsOnYourMind: topics }),
      }).then(markSaved);
    }, 800);
  }

  function handleManagerNotesChange(value: string) {
    setManagerNotes(value);
    markSaving();
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      fetch(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerNotes: value }),
      }).then(markSaved);
    }, 800);
  }

  function handleMoodSelect(value: Meeting["mood"]) {
    setMood(value);
    fetch(`/api/meetings/${meeting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: value }),
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch(`/api/meetings/${meeting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submitted: true }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      setSubmitted(true);
    }, 1800);
  }

  async function handleUnsubmit() {
    const res = await fetch(`/api/meetings/${meeting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submitted: false }),
    });
    if (res.ok) setSubmitted(false);
  }

  async function handleShare() {
    setSharing(true);
    const res = await fetch(`/api/meetings/${meeting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerShared: true }),
    });
    setSharing(false);
    if (!res.ok) return;
    setManagerShared(true);
    setCompletingReview(true);
    setTimeout(() => {
      setCompletingReview(false);
      onExitReview?.();
    }, 3000);
  }

  async function startNewMeeting() {
    setStarting(true);
    await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, meetingDate: new Date().toISOString().slice(0, 10) }),
    });
    window.location.reload();
  }

  function handleToggle(id: string, completed: boolean) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, completed } : i));
  }

  function handleAddItem(item: ActionItem) {
    setItems((prev) => [...prev, item]);
  }

  function handleEnterReview() {
    setStartingReview(true);
    setTimeout(() => {
      setStartingReview(false);
      onEnterReview?.();
    }, 2800);
  }

  if (completingReview) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-10 select-none bg-white animate-backdrop-in">
        <div className="relative flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cbre-mint animate-expand-ring"
              style={{ width: 140, height: 140, animationDelay: `${i * 0.45}s`, animationDuration: "1.8s" }}
            />
          ))}
          <div className="w-36 h-36 rounded-full bg-cbre-green flex items-center justify-center shadow-2xl animate-icon-reveal" style={{ animationDelay: "0.1s" }}>
            <svg className="w-18 h-18" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#17E88F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 60, strokeDashoffset: 0, animation: "check-draw 0.6s ease 0.4s both" }}>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-cbre-mint animate-float-particle"
              style={{
                left: `${50 + 55 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                top: `${50 + 55 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                animationDelay: `${0.3 + i * 0.08}s`,
                animationDuration: `${1.2 + (i % 3) * 0.3}s`,
              }}
            />
          ))}
        </div>
        <div className="text-center space-y-3">
          <p className="text-4xl font-bold text-cbre-green animate-text-rise" style={{ animationDelay: "0.3s", opacity: 0 }}>
            1:1 Complete
          </p>
          <p className="text-lg text-gray-400 animate-text-rise" style={{ animationDelay: "0.5s", opacity: 0 }}>
            Notes shared with {employeeName}
          </p>
        </div>
      </div>
    );
  }

  if (startingReview) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-10 select-none bg-cbre-green animate-backdrop-in">
        <div className="relative flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-cbre-mint animate-expand-ring"
              style={{ width: 140, height: 140, animationDelay: `${i * 0.5}s`, animationDuration: "2s" }}
            />
          ))}
          <div className="w-36 h-36 rounded-full bg-white/10 border-2 border-cbre-mint flex items-center justify-center shadow-2xl animate-icon-reveal" style={{ animationDelay: "0.2s" }}>
            <svg className="w-18 h-18 text-cbre-mint" width="72" height="72" fill="none" viewBox="0 0 24 24" stroke="#17E88F" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-4xl font-bold text-white animate-text-rise" style={{ animationDelay: "0.3s", opacity: 0 }}>
            Starting your 1:1
          </p>
          <p className="text-xl text-cbre-mint animate-text-rise" style={{ animationDelay: "0.5s", opacity: 0 }}>
            with {employeeName}
          </p>
        </div>
        <div className="flex gap-3 animate-text-rise" style={{ animationDelay: "0.7s", opacity: 0 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-cbre-mint animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (celebrating) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-10 select-none bg-white animate-backdrop-in">
        <div className="relative flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cbre-mint animate-expand-ring"
              style={{ width: 140, height: 140, animationDelay: `${i * 0.45}s`, animationDuration: "1.8s" }}
            />
          ))}
          <div className="w-36 h-36 rounded-full bg-cbre-green flex items-center justify-center shadow-2xl animate-icon-reveal" style={{ animationDelay: "0.1s" }}>
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#17E88F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 60, strokeDashoffset: 0, animation: "check-draw 0.6s ease 0.4s both" }}>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-cbre-mint animate-float-particle"
              style={{
                left: `${50 + 55 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                top: `${50 + 55 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                animationDelay: `${0.3 + i * 0.08}s`,
                animationDuration: `${1.2 + (i % 3) * 0.3}s`,
              }}
            />
          ))}
        </div>
        <div className="text-center space-y-3">
          <p className="text-4xl font-bold text-cbre-green animate-text-rise" style={{ animationDelay: "0.3s", opacity: 0 }}>
            You&apos;re all set!
          </p>
          <p className="text-lg text-gray-400 animate-text-rise" style={{ animationDelay: "0.5s", opacity: 0 }}>
            Your agenda is ready for review
          </p>
        </div>
      </div>
    );
  }

  // ── Review mode (manager + employee together) ─────────────────────────────
  if (reviewMode && submitted && isManager) {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Left: employee agenda (read-only) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            {mood && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">How&apos;s {employeeName} feeling?</span>
                <MoodDisplay mood={mood} />
              </div>
            )}
            {title && <h2 className="text-lg font-bold text-cbre-green">{title}</h2>}
            <button onClick={onExitReview} className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
              ← Exit Review
            </button>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{employeeName}&apos;s Agenda</p>

          {sections.whatsOnYourMind.length > 0 && (
            <ReviewCard label="What's on your mind?">
              <ul className="space-y-2">
                {sections.whatsOnYourMind.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cbre-mint shrink-0" />
                    {topic}
                  </li>
                ))}
              </ul>
            </ReviewCard>
          )}
          {sections.workingOn && (
            <ReviewCard label="What are you working on?">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.workingOn}</p>
            </ReviewCard>
          )}
          {sections.blockers && (
            <ReviewCard label="Priorities">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.blockers}</p>
            </ReviewCard>
          )}
          {(sections.growthFocus || sections.supportNeeded) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">Growth &amp; Development</p>
              <div className="grid grid-cols-2 gap-4">
                {sections.growthFocus && <div><p className="text-xs font-medium text-gray-500 mb-1">Growth focus</p><p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.growthFocus}</p></div>}
                {sections.supportNeeded && <div><p className="text-xs font-medium text-gray-500 mb-1">Support needed</p><p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.supportNeeded}</p></div>}
              </div>
            </div>
          )}
          {(sections.feedbackForManager || sections.wantFeedbackOn) && (
            <div className="grid grid-cols-2 gap-3">
              {sections.feedbackForManager && (
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">I have feedback for my manager</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.feedbackForManager}</p>
                  </div>
                  <div className="border-t border-blue-100 pt-3">
                    <p className="text-xs font-medium text-blue-600 mb-1.5">Your response</p>
                    <textarea
                      value={sections.feedbackForManagerResponse}
                      onChange={(e) => handleSectionChange("feedbackForManagerResponse", e.target.value)}
                      placeholder="Acknowledge and respond…"
                      rows={3}
                      className="w-full resize-none text-sm text-gray-800 placeholder-blue-200 focus:outline-none bg-white/60 rounded-lg px-3 py-2 border border-blue-100 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              )}
              {sections.wantFeedbackOn && (
                <div className="bg-violet-50 rounded-xl border border-violet-100 p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">I want feedback on</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.wantFeedbackOn}</p>
                  </div>
                  <div className="border-t border-violet-100 pt-3">
                    <p className="text-xs font-medium text-violet-600 mb-1.5">Your feedback</p>
                    <textarea
                      value={sections.wantFeedbackOnResponse}
                      onChange={(e) => handleSectionChange("wantFeedbackOnResponse", e.target.value)}
                      placeholder="Share your thoughts…"
                      rows={3}
                      className="w-full resize-none text-sm text-gray-800 placeholder-violet-200 focus:outline-none bg-white/60 rounded-lg px-3 py-2 border border-violet-100 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: manager workspace */}
        <div className="w-[30rem] shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide">Your Notes</p>
            {saveStatus === "saving" && <p className="text-xs text-gray-400">Saving…</p>}
            {saveStatus === "saved" && <p className="text-xs text-cbre-mint font-medium">Saved ✓</p>}
          </div>

          <div className="space-y-3">
            <SectionCard label="What's going well" value={sections.goingWellManager} onChange={(v) => handleSectionChange("goingWellManager", v)} placeholder="Strengths and wins to keep building on…" rows={4} />
            <SectionCard label="One area to focus on" value={sections.areaToFocusManager} onChange={(v) => handleSectionChange("areaToFocusManager", v)} placeholder="One concrete thing to work toward…" rows={4} />
          </div>

          <ActionItemList items={items} meetingId={meeting.id} employeeId={employeeId} employeeName={employeeName} onToggle={handleToggle} onAdd={handleAddItem} />

          <div className="flex flex-col gap-2">
            {managerShared ? (
              <p className="text-xs text-center text-cbre-mint font-medium">✓ Notes shared with {employeeName}</p>
            ) : (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="w-full py-2.5 bg-cbre-green text-white font-semibold rounded-xl hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-50 text-sm"
              >
                {sharing ? "Completing…" : `Complete Review & Share Notes`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Post-submission view ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          {mood && <MoodDisplay mood={mood} />}
          {title && <h2 className="text-lg font-bold text-cbre-green flex-1">{title}</h2>}
        </div>
        <div className={`rounded-xl p-4 flex items-center justify-between ${managerShared ? "bg-gray-800" : "bg-cbre-green"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${managerShared ? "bg-white text-gray-800" : "bg-cbre-mint text-cbre-green"}`}>✓</div>
            <div>
              <p className="text-white font-semibold text-sm">{managerShared ? "1:1 Complete" : "Agenda submitted"}</p>
              <p className={`text-xs ${managerShared ? "text-gray-400" : "text-cbre-mint"}`}>
                {managerShared ? "Notes shared with " + employeeName : employeeName + " is ready for their 1:1"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isManager && managerShared && (
              <a href="/" className="text-xs text-white/60 hover:text-white transition-colors">
                ← Dashboard
              </a>
            )}
            {isManager && !managerShared && onEnterReview && (
              <button
                onClick={handleEnterReview}
                className="text-xs font-semibold bg-cbre-mint text-cbre-green px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
              >
                Begin Review →
              </button>
            )}
            {!isManager && !managerShared && (
              <button onClick={handleUnsubmit} className="text-xs text-white/60 hover:text-white transition-colors">
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Employee agenda — always visible to both */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{employeeName}&apos;s Agenda</p>

          {sections.whatsOnYourMind.length > 0 && (
            <ReviewCard label="What's on your mind?">
              <ul className="space-y-2">
                {sections.whatsOnYourMind.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cbre-mint shrink-0" />
                    {topic}
                  </li>
                ))}
              </ul>
            </ReviewCard>
          )}
          {sections.workingOn && (
            <ReviewCard label="What are you working on?">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.workingOn}</p>
            </ReviewCard>
          )}
          {sections.blockers && (
            <ReviewCard label="Priorities">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.blockers}</p>
            </ReviewCard>
          )}
          {(sections.growthFocus || sections.supportNeeded) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">Growth & Development</p>
              <div className="grid grid-cols-2 gap-4">
                {sections.growthFocus && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Growth focus</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.growthFocus}</p>
                  </div>
                )}
                {sections.supportNeeded && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Support needed</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.supportNeeded}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {(sections.feedbackForManager || sections.wantFeedbackOn) && (
            <div className="grid grid-cols-2 gap-3">
              {sections.feedbackForManager && (
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">I have feedback for my manager</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.feedbackForManager}</p>
                  </div>
                  {(isManager || (managerShared && sections.feedbackForManagerResponse)) && (
                    <div className="border-t border-blue-100 pt-3">
                      <p className="text-xs font-medium text-blue-600 mb-1.5">{isManager ? "Your response" : "Manager's response"}</p>
                      {isManager && !managerShared ? (
                        <textarea
                          value={sections.feedbackForManagerResponse}
                          onChange={(e) => handleSectionChange("feedbackForManagerResponse", e.target.value)}
                          placeholder="Acknowledge and respond…"
                          rows={3}
                          className="w-full resize-none text-sm text-gray-800 placeholder-blue-200 focus:outline-none bg-white/60 rounded-lg px-3 py-2 border border-blue-100 focus:ring-2 focus:ring-blue-200"
                        />
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.feedbackForManagerResponse}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {sections.wantFeedbackOn && (
                <div className="bg-violet-50 rounded-xl border border-violet-100 p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">I want feedback on</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.wantFeedbackOn}</p>
                  </div>
                  {(isManager || (managerShared && sections.wantFeedbackOnResponse)) && (
                    <div className="border-t border-violet-100 pt-3">
                      <p className="text-xs font-medium text-violet-600 mb-1.5">{isManager ? "Your feedback" : "Manager's feedback"}</p>
                      {isManager && !managerShared ? (
                        <textarea
                          value={sections.wantFeedbackOnResponse}
                          onChange={(e) => handleSectionChange("wantFeedbackOnResponse", e.target.value)}
                          placeholder="Share your thoughts…"
                          rows={3}
                          className="w-full resize-none text-sm text-gray-800 placeholder-violet-200 focus:outline-none bg-white/60 rounded-lg px-3 py-2 border border-violet-100 focus:ring-2 focus:ring-violet-200"
                        />
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.wantFeedbackOnResponse}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manager prep / post-review section */}
        {isManager && !managerShared && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Prepare for Review</p>
            <div className="grid grid-cols-2 gap-3">
              <SectionCard label="What's going well" value={sections.goingWellManager} onChange={(v) => handleSectionChange("goingWellManager", v)} placeholder="Strengths and wins to acknowledge…" rows={3} />
              <SectionCard label="One area to focus on" value={sections.areaToFocusManager} onChange={(v) => handleSectionChange("areaToFocusManager", v)} placeholder="One concrete thing to work toward…" rows={3} />
            </div>
            <ActionItemList items={items} meetingId={meeting.id} employeeId={employeeId} employeeName={employeeName} onToggle={handleToggle} onAdd={handleAddItem} />
            <div className="bg-cbre-green/5 rounded-xl border border-cbre-green/20 p-4">
              <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span>🔒</span> Private Notes
                <span className="font-normal normal-case text-gray-400 ml-1">— only you can see this</span>
              </p>
              <textarea
                value={managerNotes}
                onChange={(e) => handleManagerNotesChange(e.target.value)}
                placeholder="Notes for yourself about this meeting…"
                rows={3}
                className="w-full text-sm text-gray-800 bg-white border border-cbre-green/20 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cbre-mint placeholder-gray-300"
              />
            </div>
          </div>
        )}

        {/* After review — read-only summary for both */}
        {managerShared && (sections.goingWellManager || sections.areaToFocusManager) && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Manager Feedback</p>
              {isManager && <span className="text-xs font-medium text-cbre-mint">✓ Shared with {employeeName}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sections.goingWellManager && (
                <ReviewCard label="What's going well">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.goingWellManager}</p>
                </ReviewCard>
              )}
              {sections.areaToFocusManager && (
                <ReviewCard label="One area to focus on">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{sections.areaToFocusManager}</p>
                </ReviewCard>
              )}
            </div>
          </div>
        )}

        {/* Employee waiting view */}
        {!isManager && !managerShared && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-400">Manager feedback will appear here after your 1:1</p>
            </div>
          </div>
        )}

        {/* Action items — employee view or post-review */}
        {(!isManager || managerShared) && (
          <ActionItemList items={items} meetingId={meeting.id} employeeId={employeeId} employeeName={employeeName} onToggle={handleToggle} onAdd={handleAddItem} />
        )}

        {/* Private manager notes — post-review only */}
        {isManager && managerShared && (
          <div className="bg-cbre-green/5 rounded-xl border border-cbre-green/20 p-5">
            <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span>🔒</span> Manager Notes
              <span className="font-normal normal-case text-gray-400 ml-1">— only you can see this</span>
            </p>
            <textarea
              value={managerNotes}
              onChange={(e) => handleManagerNotesChange(e.target.value)}
              placeholder="Notes for yourself about this meeting…"
              rows={3}
              className="w-full text-sm text-gray-800 bg-white border border-cbre-green/20 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cbre-mint placeholder-gray-300"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={startNewMeeting} disabled={starting} className="text-xs text-gray-400 hover:text-cbre-green transition-colors disabled:opacity-50">
            {starting ? "Starting…" : "+ New Meeting"}
          </button>
        </div>
      </div>
    );
  }

  // ── Pre-submission form (employee preps) ──────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Title + status bar */}
      <div className="flex items-center gap-4">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Give this meeting a title…"
          className="flex-1 text-lg font-bold text-cbre-green bg-transparent border-none outline-none placeholder-gray-300 focus:placeholder-gray-200"
        />
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < filledCount ? "bg-cbre-mint" : "bg-gray-200"}`} />
            ))}
          </div>
          {saveStatus === "saving" && <p className="text-xs text-gray-400">Saving…</p>}
          {saveStatus === "saved" && <p className="text-xs text-cbre-mint font-medium">Saved ✓</p>}
          <button onClick={startNewMeeting} disabled={starting} className="text-xs text-gray-400 hover:text-cbre-green transition-colors disabled:opacity-50">
            {starting ? "Starting…" : "+ New Meeting"}
          </button>
        </div>
      </div>

      {/* Mood */}
      <MoodPicker value={mood} onChange={handleMoodSelect} />

      {/* Core sections */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 focus-within:border-cbre-mint transition-colors">
          <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">What&apos;s on your mind?</p>
          <TopicList topics={sections.whatsOnYourMind} meetingId={meeting.id} onChange={handleTopicsChange} />
        </div>
        <SectionCard label="What are you working on?" value={sections.workingOn} onChange={(v) => handleSectionChange("workingOn", v)} placeholder="Current focus, projects, blockers…" rows={5} />
      </div>

      <SectionCard label="Priorities" value={sections.blockers} onChange={(v) => handleSectionChange("blockers", v)} placeholder="What are your top priorities right now?" rows={3} />

      {/* Growth & Development */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 focus-within:border-cbre-mint transition-colors">
        <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">Growth &amp; Development</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Growth focus</p>
            <textarea
              value={sections.growthFocus}
              onChange={(e) => handleSectionChange("growthFocus", e.target.value)}
              placeholder="Skills, goals, career direction…"
              rows={3}
              className="w-full resize-none text-sm text-gray-800 placeholder-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Support needed</p>
            <textarea
              value={sections.supportNeeded}
              onChange={(e) => handleSectionChange("supportNeeded", e.target.value)}
              placeholder="What would help you get there?"
              rows={3}
              className="w-full resize-none text-sm text-gray-800 placeholder-gray-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">I have feedback for my manager</p>
          <textarea
            value={sections.feedbackForManager}
            onChange={(e) => handleSectionChange("feedbackForManager", e.target.value)}
            placeholder="Things that are working, not working, or you'd like to see change…"
            rows={3}
            className="w-full resize-none text-sm text-gray-800 placeholder-blue-200 focus:outline-none bg-transparent"
          />
        </div>
        <div className="bg-violet-50 rounded-xl border border-violet-100 p-4">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">I want feedback on</p>
          <textarea
            value={sections.wantFeedbackOn}
            onChange={(e) => handleSectionChange("wantFeedbackOn", e.target.value)}
            placeholder="Areas where you'd like the manager's input…"
            rows={3}
            className="w-full resize-none text-sm text-gray-800 placeholder-violet-200 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Action items + private manager notes */}
      <div className={`grid gap-3 ${isManager ? "grid-cols-2" : "grid-cols-1"}`}>
        <ActionItemList items={items} meetingId={meeting.id} employeeId={employeeId} employeeName={employeeName} onToggle={handleToggle} onAdd={handleAddItem} />
        {isManager && (
          <div className="bg-cbre-green/5 rounded-xl border border-cbre-green/20 p-4 flex flex-col">
            <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span>🔒</span> Manager Notes
              <span className="font-normal normal-case text-gray-400 ml-1">— only you can see this</span>
            </p>
            <textarea
              value={managerNotes}
              onChange={(e) => handleManagerNotesChange(e.target.value)}
              placeholder="Notes for yourself about this meeting…"
              className="flex-1 w-full text-sm text-gray-800 bg-white border border-cbre-green/20 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cbre-mint placeholder-gray-300"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || filledCount === 0}
        className="w-full py-2.5 bg-cbre-green text-white font-semibold rounded-xl hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Ready for Review →"}
      </button>
    </div>
  );
}

function ReviewCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">{label}</p>
      {children}
    </div>
  );
}

const MOODS: { value: NonNullable<Meeting["mood"]>; emoji: string; label: string; bg: string; ring: string }[] = [
  { value: "great",      emoji: "🤩", label: "Great",      bg: "bg-emerald-50", ring: "ring-emerald-400" },
  { value: "good",       emoji: "😊", label: "Good",       bg: "bg-green-50",   ring: "ring-green-400"   },
  { value: "okay",       emoji: "😐", label: "Okay",       bg: "bg-yellow-50",  ring: "ring-yellow-400"  },
  { value: "tough",      emoji: "😔", label: "Tough",      bg: "bg-orange-50",  ring: "ring-orange-400"  },
  { value: "struggling", emoji: "😤", label: "Struggling", bg: "bg-rose-50",    ring: "ring-rose-400"    },
];

export function MoodDisplay({ mood }: { mood: Meeting["mood"] }) {
  if (!mood) return null;
  const m = MOODS.find((x) => x.value === mood);
  if (!m) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${m.bg} border border-current/10`}>
      <span className="text-base">{m.emoji}</span>
      <span className="text-gray-700">{m.label}</span>
    </span>
  );
}

export function MoodPicker({ value, onChange, inline }: { value: Meeting["mood"]; onChange: (v: Meeting["mood"]) => void; inline?: boolean }) {
  if (inline) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        {MOODS.map((m) => {
          const selected = value === m.value;
          return (
            <button
              key={m.value}
              onClick={() => onChange(selected ? undefined : m.value)}
              title={m.label}
              className={`w-9 h-9 rounded-full text-xl flex items-center justify-center transition-all duration-150 ${
                selected ? `${m.bg} ${m.ring} ring-2 scale-110` : "hover:scale-110 hover:bg-gray-100"
              }`}
            >
              {m.emoji}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-4">How are you feeling today?</p>
      <div className="flex gap-2 flex-wrap">
        {MOODS.map((m) => {
          const selected = value === m.value;
          return (
            <button
              key={m.value}
              onClick={() => onChange(selected ? undefined : m.value)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all duration-150 ${
                selected
                  ? `${m.bg} ${m.ring} ring-2 border-transparent scale-105 shadow-sm`
                  : "border-gray-100 hover:border-gray-200 hover:scale-105 bg-gray-50"
              }`}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className="text-xs font-medium text-gray-600">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
