import { NextRequest } from "next/server";
import { employeesContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Employee } from "@/types";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { resources } = await employeesContainer.items.readAll<Employee>().fetchAll();
  return Response.json(resources);
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as { name: string; cadence: "weekly" | "biweekly" };
  const employee: Employee = {
    id: crypto.randomUUID(),
    name: body.name,
    token: crypto.randomUUID(),
    cadence: body.cadence,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await employeesContainer.items.create<Employee>(employee);
  if (!resource) return Response.json({ error: "Internal error" }, { status: 500 });
  return Response.json(resource, { status: 201 });
}
