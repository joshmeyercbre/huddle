export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { employeesContainer } from "@/lib/cosmos";
import { requireAuth } from "@/lib/auth";
import { sendHuddleLinkEmail } from "@/lib/notify";
import type { Employee } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { resource: employee } = await employeesContainer.item(params.id, params.id).read<Employee>();
  if (!employee) return Response.json({ error: "Not found" }, { status: 404 });
  if (!employee.email) return Response.json({ error: "No email on file" }, { status: 400 });

  await sendHuddleLinkEmail(employee);
  return new Response(null, { status: 204 });
}
