import type { MeetingSections, MeetingType } from "@/types";

export function initialSections(type: MeetingType): MeetingSections {
  const base: MeetingSections = { whatsOnYourMind: [], winOfWeek: "", workingOn: "", blockers: "" };
  if (type === "quarterly") return { ...base, winsThisQuarter: "", goalsReview: "", careerDevelopment: "", nextQuarterPriorities: "" };
  if (type === "onboarding") return { ...base, howIsItGoing: "", whatIsWorkingWell: "", whatIsUnclear: "", whatDoYouNeed: "" };
  return base;
}

export const CADENCE_DAYS: Record<"weekly" | "biweekly", number> = { weekly: 7, biweekly: 14 };
