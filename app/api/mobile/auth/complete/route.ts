import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { signTeacherToken } from "@/lib/mobile-auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const returnUrl = request.nextUrl.searchParams.get('returnUrl') || 'mdamengaji://login';

  if (!session || !session.user || !session.user.email) {
    // Return 302 redirect with error
    return new Response(null, {
      status: 302,
      headers: { Location: `${returnUrl}?error=failed` },
    });
  }

  const email = session.user.email;

  // Fetch role directly from database
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/schema");
  const { eq } = await import("drizzle-orm");

  const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const role = dbUsers.length > 0 ? dbUsers[0].role : null;
  const userId = dbUsers.length > 0 ? dbUsers[0].id : null;

  if (role !== 'teacher' && role !== 'admin') {
    return new Response(null, {
      status: 302,
      headers: { Location: `${returnUrl}?error=not_teacher` },
    });
  }

  if (!userId) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${returnUrl}?error=failed` },
    });
  }

  const token = signTeacherToken({ userId, email, role: role as string });

  // HTTP 302 redirect to the custom scheme URL
  // This is what openAuthSessionAsync can detect and intercept!
  return new Response(null, {
    status: 302,
    headers: { Location: `${returnUrl}?token=${token}` },
  });
}
