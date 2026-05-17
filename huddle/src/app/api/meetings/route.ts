export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { meetingsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import { carryOverIncompleteItems } from "@/lib/carryover";
import type { Meeting } from "@/types";

const EMPTY_SECTIONS = {
  whatsOnYourMind: [] as string[],
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

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as { employeeId?: string; meetingDate?: string };
  if (!body.employeeId || !body.meetingDate) {
    return Response.json({ error: "employeeId and meetingDate are required" }, { status: 400 });
  }

  // Prevent duplicate meetings for the same date
  const { resources: existing } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid AND c.meetingDate = @date",
      parameters: [{ name: "@eid", value: body.employeeId }, { name: "@date", value: body.meetingDate }],
    })
    .fetchAll();
  if (existing.length > 0) {
    return Response.json({ error: "A meeting already exists for this date", meeting: existing[0] }, { status: 409 });
  }

  const { resources: previous } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
      parameters: [{ name: "@eid", value: body.employeeId }],
    })
    .fetchAll();

  const { resources: countResult } = await meetingsContainer.items
    .query<number>({
      query: "SELECT VALUE COUNT(1) FROM c WHERE c.employeeId = @eid",
      parameters: [{ name: "@eid", value: body.employeeId }],
    })
    .fetchAll();
  const meetingNumber = ((countResult[0] as unknown as number) ?? 0) + 1;

  const meeting: Meeting = {
    id: crypto.randomUUID(),
    employeeId: body.employeeId,
    meetingDate: body.meetingDate,
    createdAt: new Date().toISOString(),
    number: meetingNumber,
    sections: { ...EMPTY_SECTIONS },
  };

  const { resource } = await meetingsContainer.items.create<Meeting>(meeting);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  if (previous.length > 0) {
    await carryOverIncompleteItems(previous[0].id, resource.id, body.employeeId);
  }

  return Response.json(resource, { status: 201 });
}
