import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { verifyTeacherToken } from "@/lib/mobile-auth";

type AuthCheckResult =
  | { ok: true; source: "web"; role: string; userId: number }
  | { ok: true; source: "mobile"; role: string; userId: number }
  | { ok: false; status: number; message: string };

function extractMobileToken(req: NextRequest, bodyToken?: string | null): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  const queryToken = req.nextUrl.searchParams.get("token");
  if (queryToken) return queryToken;
  return bodyToken ?? null;
}

/**
 * Accepts either a NextAuth web session (admin/teacher) or a signed mobile
 * teacher JWT (header `Authorization: Bearer <token>`, `?token=`, or a
 * `token` field in the JSON body). Needed because these endpoints are called
 * by both the web admin app (session cookie) and the mobile teacher app
 * (JWT, no cookie) - a session-only guard would lock the mobile app out.
 */
export async function requireTeacherOrAdmin(
  req: NextRequest,
  bodyToken?: string | null
): Promise<AuthCheckResult> {
  const session = await getServerSession(authOptions);
  const sessionRole = (session?.user as any)?.role;
  if (session?.user && (sessionRole === "admin" || sessionRole === "teacher")) {
    return { ok: true, source: "web", role: sessionRole, userId: Number((session.user as any).id) };
  }

  const token = extractMobileToken(req, bodyToken);
  const payload = verifyTeacherToken(token);
  if (payload?.userId) {
    return { ok: true, source: "mobile", role: payload.role ?? "teacher", userId: Number(payload.userId) };
  }

  return { ok: false, status: 401, message: "Anda harus login terlebih dahulu." };
}
