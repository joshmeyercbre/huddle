import { NextRequest } from "next/server";
import { employeesContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import type { Employee } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json() as Partial<Pick<Employee, "name" | "cadence" | "token">>;
  const { resource: existing } = await employeesContainer.item(params.id, params.id).read<Employee>();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const updated: Employee = { ...existing, ...body };
  const { resource } = await employeesContainer.item(params.id, params.id).replace<Employee>(updated);
  return Response.json(resource);
}
