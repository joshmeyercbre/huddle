export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { meetingsContainer, employeesContainer, actionItemsContainer } from "@/lib/cosmos";
import { sendMeetingSummary } from "@/lib/notify";
import { carryOverIncompleteItems } from "@/lib/carryover";
import { getBonusQuestion } from "@/lib/bonusQuestions";
import { initialSections, CADENCE_DAYS, nextMeetingNumber } from "@/lib/meetingUtils";
import { requireAuth } from "@/lib/auth";
import type { Meeting, MeetingSections, Employee, ActionItem } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { resource } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!resource) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(resource);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json() as Partial<MeetingSections> & { completedAt?: string; sentiment?: 1 | 2 | 3 | 4 | 5 };
  const { completedAt, sentiment, ...sectionUpdates } = body;

  if (completedAt) {
    const authError = requireAuth(req);
    if (authError) return authError;
  }

  const { resource: existing } = await meetingsContainer.item(params.id, params.id).read<Meeting>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: Meeting = {
    ...existing,
    sections: { ...existing.sections, ...sectionUpdates },
    ...(completedAt ? { completedAt } : {}),
    ...(sentiment !== undefined ? { sentiment } : {}),
  };

  const { resource } = await meetingsContainer.item(params.id, params.id).replace<Meeting>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  if (completedAt && !existing.completedAt) {
    const { resource: employee } = await employeesContainer.item(existing.employeeId, existing.employeeId).read<Employee>();
    const { resources: actionItems } = await actionItemsContainer.items
      .query<ActionItem>({
        query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
        parameters: [{ name: "@mid", value: existing.id }],
      })
      .fetchAll();
    if (employee) {
      try {
        await sendMeetingSummary(employee, resource, actionItems);
      } catch {
        // Email failure must not crash the response — meeting is already saved
      }

      try {
        // Auto-create the next meeting if one doesn't already exist
        const days = CADENCE_DAYS[employee.cadence];
        const currentDate = new Date(existing.meetingDate);
        currentDate.setUTCDate(currentDate.getUTCDate() + days);
        const nextDateStr = currentDate.toISOString().split("T")[0];

        const { resources: future } = await meetingsContainer.items
          .query<Meeting>({
            query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid AND c.meetingDate >= @next",
            parameters: [
              { name: "@eid", value: existing.employeeId },
              { name: "@next", value: nextDateStr },
            ],
          })
          .fetchAll();

        if (future.length === 0) {
          const sections = initialSections("standard");
          sections.bonusQuestionText = getBonusQuestion(nextDateStr);
          const number = await nextMeetingNumber(existing.employeeId);
          const nextMeeting: Meeting = {
            id: crypto.randomUUID(),
            employeeId: existing.employeeId,
            meetingDate: nextDateStr,
            createdAt: new Date().toISOString(),
            number,
            type: "standard",
            sections,
          };
          const { resource: created } = await meetingsContainer.items.create<Meeting>(nextMeeting);
          if (created) {
            await carryOverIncompleteItems(existing.id, created.id, existing.employeeId);
          }
        }
      } catch {
        // Next-meeting creation failure must not crash the response
      }
    }
  }

  return Response.json(resource);
}
