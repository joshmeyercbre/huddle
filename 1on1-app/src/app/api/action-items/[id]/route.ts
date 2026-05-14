import { NextRequest } from "next/server";
import { actionItemsContainer } from "@/lib/cosmos";
import type { ActionItem } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json() as Partial<Pick<ActionItem, "completed" | "text">>;
  const { resource: existing } = await actionItemsContainer.item(params.id, params.id).read<ActionItem>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: ActionItem = { ...existing, ...body };
  const { resource } = await actionItemsContainer.item(params.id, params.id).replace<ActionItem>(updated);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource);
}
