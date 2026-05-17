export interface Employee {
  id: string;
  name: string;
  token: string;
  cadence: "weekly" | "biweekly";
  createdAt: string;
  managerId?: string;
}

export interface MeetingSections {
  whatsOnYourMind: string[];
  workingOn: string;
  blockers: string;
  growthFocus: string;
  supportNeeded: string;
  feedbackForManager: string;
  wantFeedbackOn: string;
  goingWellManager: string;
  areaToFocusManager: string;
  feedbackForManagerResponse: string;
  wantFeedbackOnResponse: string;
}

export interface Meeting {
  id: string;
  employeeId: string;
  meetingDate: string;
  createdAt: string;
  sections: MeetingSections;
  mood?: "great" | "good" | "okay" | "tough" | "struggling";
  submitted?: boolean;
  managerShared?: boolean;
  title?: string;
  managerNotes?: string;
}

export type RetroFormat = "classic" | "start_stop_continue" | "mad_sad_glad";

export interface Retro {
  id: string;
  token: string;
  title?: string;
  sprintName: string;
  managerId: string;
  status: "open" | "closed";
  format?: RetroFormat;
  timerEndsAt?: string;
  timerDurationMs?: number;
  createdAt: string;
}

export interface RetroItem {
  id: string;
  retroId: string;
  category: string;
  text: string;
  authorName: string;
  votes: number;
  isAction?: boolean;
  completedAction?: boolean;
  priority?: Priority;
  createdAt: string;
}

export interface TeamSettings {
  id: string;        // managerId
  teamToken: string;
}

export type Priority = "high" | "medium" | "low";

export interface ActionItem {
  id: string;
  meetingId: string;
  employeeId: string;
  text: string;
  assignee: "manager" | "employee";
  completed: boolean;
  carriedOver: boolean;
  priority?: Priority;
  createdAt: string;
}

