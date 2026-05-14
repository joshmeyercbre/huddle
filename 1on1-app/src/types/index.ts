export interface Employee {
  id: string;
  name: string;
  token: string;
  cadence: "weekly" | "biweekly";
  createdAt: string;
}

export interface MeetingSections {
  whatsOnYourMind: string[];
  winOfWeek: string;
  workingOn: string;
  blockers: string;
}

export interface Meeting {
  id: string;
  employeeId: string;
  meetingDate: string;
  createdAt: string;
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
