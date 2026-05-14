import { getClientPrincipal, requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

function makeRequest(principalJson?: object): NextRequest {
  const headers: Record<string, string> = {};
  if (principalJson) {
    headers["x-ms-client-principal"] = Buffer.from(
      JSON.stringify(principalJson)
    ).toString("base64");
  }
  return new NextRequest("http://localhost/api/test", { headers });
}

describe("getClientPrincipal", () => {
  it("returns null when header is absent", () => {
    expect(getClientPrincipal(makeRequest())).toBeNull();
  });

  it("parses a valid principal header", () => {
    const principal = { userId: "abc123", userDetails: "user@example.com", userRoles: ["authenticated"] };
    expect(getClientPrincipal(makeRequest(principal))).toEqual(principal);
  });

  it("returns null for malformed base64", () => {
    const req = new NextRequest("http://localhost/api/test", {
      headers: { "x-ms-client-principal": "not-valid-base64!!!" },
    });
    expect(getClientPrincipal(req)).toBeNull();
  });
});

describe("requireAuth", () => {
  it("returns null (pass-through) when principal is present", () => {
    const principal = { userId: "abc", userDetails: "u@e.com", userRoles: ["authenticated"] };
    expect(requireAuth(makeRequest(principal))).toBeNull();
  });

  it("returns a 401 Response when principal is absent", async () => {
    const response = requireAuth(makeRequest());
    expect(response).not.toBeNull();
    expect(response!.status).toBe(401);
    const body = await response!.json();
    expect(body.error).toBe("Unauthorized");
  });
});
