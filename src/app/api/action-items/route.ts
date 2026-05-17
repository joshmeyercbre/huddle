export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { actionItemsContainer } from "@/lib/cosmos";
import type { ActionItem } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json() as Pick<ActionItem, "meetingId" | "employeeId" | "text" | "assignee">;
  const item: ActionItem = {
    id: crypto.randomUUID(),
    ...body,
    completed: false,
    carriedOver: false,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await actionItemsContainer.items.create<ActionItem>(item);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource, { status: 201 });
}
