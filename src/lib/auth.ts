import { NextRequest } from "next/server";

export interface ClientPrincipal {
  identityProvider?: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

const DEV_MANAGER_ID = "209860716";

export function parsePrincipal(header: string | null): ClientPrincipal | null {
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf-8")) as ClientPrincipal;
  } catch {
    return null;
  }
}

export function getClientPrincipal(req: NextRequest): ClientPrincipal | null {
  return parsePrincipal(req.headers.get("x-ms-client-principal"));
}

export function getManagerId(req: NextRequest): string {
  if (process.env.NODE_ENV === "development") return DEV_MANAGER_ID;
  const principal = parsePrincipal(req.headers.get("x-ms-client-principal"));
  if (!principal) return "";
  return principal.userId;
}

export function getManagerIdFromHeader(header: string | null): string {
  if (process.env.NODE_ENV === "development") return DEV_MANAGER_ID;
  const principal = parsePrincipal(header);
  if (!principal) return "";
  return principal.userId;
}

export function requireAuth(req: NextRequest): Response | null {
  if (process.env.NODE_ENV === "development") return null;
  if (!getClientPrincipal(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
