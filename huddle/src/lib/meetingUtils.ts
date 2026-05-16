import { meetingsContainer } from "@/lib/cosmos";
import type { MeetingSections, MeetingType } from "@/types";

export function initialSections(type: MeetingType): MeetingSections {
  const base: MeetingSections = { whatsOnYourMind: [], winOfWeek: "", workingOn: "", blockers: "" };
  if (type === "quarterly") return { ...base, winsThisQuarter: "", goalsReview: "", careerDevelopment: "", nextQuarterPriorities: "" };
  if (type === "onboarding") return { ...base, howIsItGoing: "", whatIsWorkingWell: "", whatIsUnclear: "", whatDoYouNeed: "" };
  return base;
}

export const CADENCE_DAYS: Record<"weekly" | "biweekly", number> = { weekly: 7, biweekly: 14 };

export async function nextMeetingNumber(employeeId: string): Promise<number> {
  const { resources } = await meetingsContainer.items
    .query<number>({
      query: "SELECT VALUE COUNT(1) FROM c WHERE c.employeeId = @eid",
      parameters: [{ name: "@eid", value: employeeId }],
    })
    .fetchAll();
  return (resources[0] ?? 0) + 1;
}
