import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyTeacherToken } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get("token");

  if (!tokenParam) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 400 });
  }

  const payload = verifyTeacherToken(tokenParam);
  const teacherId = payload ? Number(payload.userId) : null;

  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }

  try {
    const result = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, teacherId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("API Teacher Me Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
