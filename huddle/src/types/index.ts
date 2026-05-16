export interface Employee {
  id: string;
  name: string;
  token: string;
  cadence: "weekly" | "biweekly";
  email?: string;
  notifyDaysBefore?: 0 | 1;
  createdAt: string;
}

export type MeetingType = "standard" | "quarterly" | "onboarding";

export interface MeetingSections {
  // standard
  whatsOnYourMind: string[];
  winOfWeek: string;
  workingOn: string;
  blockers: string;
  // quarterly
  winsThisQuarter?: string;
  goalsReview?: string;
  careerDevelopment?: string;
  nextQuarterPriorities?: string;
  // onboarding
  howIsItGoing?: string;
  whatIsWorkingWell?: string;
  whatIsUnclear?: string;
  whatDoYouNeed?: string;
}

export interface Meeting {
  id: string;
  employeeId: string;
  meetingDate: string;
  createdAt: string;
  type?: MeetingType;
  completedAt?: string;
  sentiment?: 1 | 2 | 3 | 4 | 5;
  sections: MeetingSections;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  employeeId: string;
  text: string;
  assignee: "manager" | "employee";
  completed: boolean;
  carriedOver: boolean;
  createdAt: string;
}
