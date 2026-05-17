export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { employeesContainer, meetingsContainer } from "@/lib/cosmos";
import { carryOverIncompleteItems } from "@/lib/carryover";
import type { Employee, Meeting } from "@/types";

const CADENCE_DAYS: Record<Employee["cadence"], number> = { weekly: 7, biweekly: 14 };

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
  const secret = process.env.SCHEDULE_SECRET;
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { resources: employees } = await employeesContainer.items
    .query<Employee>("SELECT * FROM c")
    .fetchAll();

  let created = 0;
  let skipped = 0;

  for (const employee of employees) {
    const meetingDateStr = today.toISOString().split("T")[0];

    const { resources: meetings } = await meetingsContainer.items
      .query<Meeting>({
        query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
        parameters: [{ name: "@eid", value: employee.id }],
      })
      .fetchAll();

    const last = meetings[0] ?? null;

    if (last) {
      if (last.meetingDate === meetingDateStr) { skipped++; continue; }
      const lastDate = new Date(last.meetingDate);
      lastDate.setUTCHours(0, 0, 0, 0);
      const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / 86_400_000);
      if (daysSince < CADENCE_DAYS[employee.cadence]) { skipped++; continue; }
    }

    const meeting: Meeting = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      meetingDate: meetingDateStr,
      createdAt: new Date().toISOString(),
      sections: { ...EMPTY_SECTIONS },
    };

    const { resource } = await meetingsContainer.items.create<Meeting>(meeting);
    if (!resource) continue;
    if (last) await carryOverIncompleteItems(last.id, resource.id, employee.id);
    created++;
  }

  return Response.json({ created, skipped });
}
