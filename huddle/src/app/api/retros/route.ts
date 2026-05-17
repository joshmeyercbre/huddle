export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { retrosContainer, retroItemsContainer } from "@/lib/cosmos";
import { requireAuth, getManagerId } from "@/lib/auth";
import type { Retro, RetroItem } from "@/types";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const managerId = getManagerId(req);
  const { resources } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.managerId = @mid ORDER BY c.createdAt DESC",
      parameters: [{ name: "@mid", value: managerId }],
    })
    .fetchAll();
  return Response.json(resources);
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const managerId = getManagerId(req);
  const body = await req.json() as { sprintName: string; format?: Retro["format"] };
  const retro: Retro = {
    id: crypto.randomUUID(),
    token: crypto.randomUUID(),
    sprintName: body.sprintName,
    managerId,
    status: "open",
    format: body.format ?? "classic",
    createdAt: new Date().toISOString(),
  };
  const { resource } = await retrosContainer.items.create<Retro>(retro);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });

  // Carry over open action items from all previous retros for this manager
  try {
    const { resources: allPreviousRetros } = await retrosContainer.items
      .query<Retro>({
        query: "SELECT * FROM c WHERE c.managerId = @mid AND c.id != @rid",
        parameters: [{ name: "@mid", value: managerId }, { name: "@rid", value: resource.id }],
      })
      .fetchAll();

    const allItems = (
      await Promise.all(
        allPreviousRetros.map((retro) =>
          retroItemsContainer.items
            .query<RetroItem>({
              query: "SELECT * FROM c WHERE c.retroId = @rid",
              parameters: [{ name: "@rid", value: retro.id }],
            })
            .fetchAll()
            .then((r) => r.resources)
        )
      )
    ).flat();

    const toCarryOver = allItems.filter((i) => i.isAction && !i.completedAction);

    const created = await Promise.all(
      toCarryOver.map((item) =>
        retroItemsContainer.items.create<RetroItem>({
          id: crypto.randomUUID(),
          retroId: resource.id,
          category: item.category,
          text: item.text,
          authorName: item.authorName,
          votes: 0,
          isAction: true,
          completedAction: false,
          createdAt: new Date().toISOString(),
        })
      )
    );

  } catch {
  }

  return Response.json(resource, { status: 201 });
}
