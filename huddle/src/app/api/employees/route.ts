export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { employeesContainer } from "@/lib/cosmos";
import { requireAuth, getManagerId } from "@/lib/auth";
import type { Employee } from "@/types";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const managerId = getManagerId(req);
  const { resources } = await employeesContainer.items
    .query<Employee>({
      query: "SELECT * FROM c WHERE c.managerId = @mid",
      parameters: [{ name: "@mid", value: managerId }],
    })
    .fetchAll();
  return Response.json(resources);
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const managerId = getManagerId(req);
  const body = await req.json() as { name: string; cadence: "weekly" | "biweekly" };
  const employee: Employee = {
    id: crypto.randomUUID(),
    name: body.name,
    token: crypto.randomUUID(),
    cadence: body.cadence,
    createdAt: new Date().toISOString(),
    managerId,
  };
  const { resource } = await employeesContainer.items.create<Employee>(employee);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource, { status: 201 });
}
