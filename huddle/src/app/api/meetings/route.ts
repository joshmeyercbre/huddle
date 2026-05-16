export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { meetingsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import { carryOverIncompleteItems } from "@/lib/carryover";
import { getBonusQuestion } from "@/lib/bonusQuestions";
import type { Meeting, MeetingType, MeetingSections } from "@/types";

function initialSections(type: MeetingType): MeetingSections {
  const base: MeetingSections = { whatsOnYourMind: [], winOfWeek: "", workingOn: "", blockers: "" };
  if (type === "quarterly") return { ...base, winsThisQuarter: "", goalsReview: "", careerDevelopment: "", nextQuarterPriorities: "" };
  if (type === "onboarding") return { ...base, howIsItGoing: "", whatIsWorkingWell: "", whatIsUnclear: "", whatDoYouNeed: "" };
  return base;
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { employeeId, meetingDate, type = "standard" } = await req.json() as { employeeId: string; meetingDate: string; type?: MeetingType };

  const { resources: previous } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
      parameters: [{ name: "@eid", value: employeeId }],
    })
    .fetchAll();

  const sections = initialSections(type);
  if (type === "standard") {
    sections.bonusQuestionText = getBonusQuestion(meetingDate);
  }

  const meeting: Meeting = {
    id: crypto.randomUUID(),
    employeeId,
    meetingDate,
    createdAt: new Date().toISOString(),
    type,
    sections,
  };

  const { resource } = await meetingsContainer.items.create<Meeting>(meeting);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  if (previous.length > 0) {
    await carryOverIncompleteItems(previous[0].id, resource.id, employeeId);
  }

  return Response.json(resource, { status: 201 });
}
