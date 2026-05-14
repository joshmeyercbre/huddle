import { NextRequest } from "next/server";
import { meetingsContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import { carryOverIncompleteItems } from "@/lib/carryover";
import type { Meeting } from "@/types";

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { employeeId, meetingDate } = await req.json() as { employeeId: string; meetingDate: string };

  const { resources: previous } = await meetingsContainer.items
    .query<Meeting>({
      query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
      parameters: [{ name: "@eid", value: employeeId }],
    })
    .fetchAll();

  const meeting: Meeting = {
    id: crypto.randomUUID(),
    employeeId,
    meetingDate,
    createdAt: new Date().toISOString(),
    sections: {
      whatsOnYourMind: [],
      winOfWeek: "",
      workingOn: "",
      blockers: "",
    },
  };

  const { resource } = await meetingsContainer.items.create<Meeting>(meeting);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  if (previous.length > 0) {
    await carryOverIncompleteItems(previous[0].id, resource.id, employeeId);
  }

  return Response.json(resource, { status: 201 });
}
