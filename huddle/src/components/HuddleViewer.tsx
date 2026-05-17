"use client";
import { useState } from "react";
import type { Meeting, ActionItem } from "@/types";
import MeetingEditor, { MoodDisplay } from "@/components/MeetingEditor";

interface Props {
  currentMeeting: Meeting;
  currentActionItems: ActionItem[];
  pastMeetings: { meeting: Meeting; actionItems: ActionItem[] }[];
  employeeId: string;
  employeeName: string;
  isManager: boolean;
}

export default function HuddleViewer({ currentMeeting, currentActionItems, pastMeetings, employeeId, employeeName, isManager }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  const selected = pastMeetings.find(({ meeting }) => meeting.id === selectedId);

  return (
    <div className="flex flex-1 overflow-hidden">
      {!reviewMode && pastMeetings.length > 0 && (
        <aside className="w-60 shrink-0 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
          <div className="px-4 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">1:1 History</p>
            <div className="space-y-1">
              {/* Current meeting — always first */}
              <button
                onClick={() => setSelectedId(null)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  selectedId === null
                    ? "bg-cbre-green text-white"
                    : "text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <span className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-semibold truncate">
                    {new Date(currentMeeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                    currentMeeting.managerShared
                      ? selectedId === null ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      : currentMeeting.submitted
                        ? selectedId === null ? "bg-cbre-mint text-cbre-green" : "bg-cbre-mint/20 text-cbre-green"
                        : selectedId === null ? "bg-cbre-mint text-cbre-green" : "bg-cbre-green/10 text-cbre-green"
                  }`}>
                    {currentMeeting.managerShared ? "Reviewed" : currentMeeting.submitted ? "Ready" : "Current"}
                  </span>
                </span>
                {currentMeeting.title && (
                  <span className={`block text-xs truncate ${selectedId === null ? "text-cbre-mint" : "text-gray-400"}`}>
                    {currentMeeting.title}
                  </span>
                )}
              </button>

              {/* Past meetings */}
              {pastMeetings.map(({ meeting }) => {
                const isActive = selectedId === meeting.id;
                const openCount = pastMeetings.find(p => p.meeting.id === meeting.id)?.actionItems.filter(i => !i.completed).length ?? 0;
                return (
                  <button
                    key={meeting.id}
                    onClick={() => setSelectedId(meeting.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-cbre-green text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {new Date(meeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      {openCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${isActive ? "bg-cbre-mint text-cbre-green" : "bg-gray-100 text-gray-600"}`}>
                          {openCount}
                        </span>
                      )}
                    </span>
                    {meeting.title && (
                      <span className={`block text-xs truncate mt-0.5 ${isActive ? "text-cbre-mint" : "text-gray-400"}`}>
                        {meeting.title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      )}

      <main className={`flex-1 overflow-hidden ${reviewMode ? "flex" : "overflow-y-auto"}`}>
        {/* Single MeetingEditor instance — never unmounts, preserving state across review mode transitions */}
        <div className={`${selected && !reviewMode ? "hidden" : ""} ${reviewMode ? "flex flex-1 overflow-hidden" : "max-w-4xl mx-auto px-8 py-6 w-full"}`}>
          <MeetingEditor
            meeting={currentMeeting}
            actionItems={currentActionItems}
            employeeId={employeeId}
            employeeName={employeeName}
            isManager={isManager}
            reviewMode={reviewMode}
            onEnterReview={() => setReviewMode(true)}
            onExitReview={() => setReviewMode(false)}
          />
        </div>
        {selected && !reviewMode && (
          <div className="max-w-4xl mx-auto px-8 py-6 w-full">
            <PastMeetingView meeting={selected.meeting} actionItems={selected.actionItems} employeeName={employeeName} isManager={isManager} />
          </div>
        )}
      </main>
    </div>
  );
}

function PastMeetingView({ meeting, actionItems, employeeName, isManager }: { meeting: Meeting; actionItems: ActionItem[]; employeeName: string; isManager: boolean }) {
  const open = actionItems.filter(i => !i.completed);
  const done = actionItems.filter(i => i.completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Past Meeting</p>
          <h2 className="text-lg font-bold text-cbre-green">
            {meeting.title || new Date(meeting.meetingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </h2>
          {meeting.title && (
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(meeting.meetingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {meeting.mood && <MoodDisplay mood={meeting.mood} />}
          {meeting.submitted && (
            <span className="text-xs font-medium bg-cbre-mint-light text-cbre-green px-3 py-1 rounded-full border border-cbre-mint">
              ✓ Submitted
            </span>
          )}
        </div>
      </div>

      {meeting.sections.whatsOnYourMind.length > 0 && (
        <Section label="What's on your mind?">
          <ul className="space-y-2">
            {meeting.sections.whatsOnYourMind.map((topic, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cbre-mint shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {meeting.sections.workingOn && (
        <Section label="What are you working on?">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.workingOn}</p>
        </Section>
      )}

      {meeting.sections.blockers && (
        <Section label="Priorities">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.blockers}</p>
        </Section>
      )}

      {(meeting.sections.growthFocus || meeting.sections.supportNeeded) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">Growth &amp; Development</p>
          <div className="grid grid-cols-2 gap-4">
            {meeting.sections.growthFocus && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Growth focus</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.growthFocus}</p>
              </div>
            )}
            {meeting.sections.supportNeeded && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Support needed</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.supportNeeded}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {(meeting.sections.feedbackForManager || meeting.sections.wantFeedbackOn) && (
        <div className="grid grid-cols-2 gap-3">
          {meeting.sections.feedbackForManager && (
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">I have feedback for my manager</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.feedbackForManager}</p>
            </div>
          )}
          {meeting.sections.wantFeedbackOn && (
            <div className="bg-violet-50 rounded-xl border border-violet-100 p-4">
              <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">I want feedback on</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.wantFeedbackOn}</p>
            </div>
          )}
        </div>
      )}

      {(isManager || meeting.managerShared) && (meeting.sections.goingWellManager || meeting.sections.areaToFocusManager || meeting.sections.growthDevelopment) && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Manager Feedback</p>
          <div className="grid grid-cols-2 gap-3">
            {meeting.sections.goingWellManager && (
              <Section label="What's going well">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.goingWellManager}</p>
              </Section>
            )}
            {meeting.sections.areaToFocusManager && (
              <Section label="One area to focus on">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.areaToFocusManager}</p>
              </Section>
            )}
          </div>
          {meeting.sections.growthDevelopment && (
            <Section label="Growth & Development">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.sections.growthDevelopment}</p>
            </Section>
          )}
        </div>
      )}

      {isManager && (meeting.managerNotes || true) && (
        <div className="bg-cbre-green/5 rounded-xl border border-cbre-green/20 p-5">
          <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <span>🔒</span> Manager Notes
          </p>
          {meeting.managerNotes ? (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting.managerNotes}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No notes for this meeting.</p>
          )}
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-4">Action Items</p>
          {open.length > 0 && (
            <div className="space-y-2 mb-4">
              {open.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-cbre-mint shrink-0" />
                  <span className="flex-1 text-sm text-gray-800">{item.text}</span>
                  <span className="text-xs font-medium text-cbre-green bg-cbre-green-light px-2 py-0.5 rounded-full">
                    {item.assignee === "manager" ? "You" : employeeName}
                  </span>
                </div>
              ))}
            </div>
          )}
          {done.length > 0 && (
            <>
              {open.length > 0 && <div className="border-t border-gray-100 my-3" />}
              <div className="space-y-2">
                {done.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                    <span className="flex-1 text-sm text-gray-400 line-through">{item.text}</span>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.assignee === "manager" ? "You" : employeeName}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">{label}</p>
      {children}
    </div>
  );
}
