import { NextRequest } from "next/server";

export interface ClientPrincipal {
  identityProvider?: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export function getClientPrincipal(req: NextRequest): ClientPrincipal | null {
  const header = req.headers.get("x-ms-client-principal");
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf-8")) as ClientPrincipal;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): Response | null {
  if (!getClientPrincipal(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
