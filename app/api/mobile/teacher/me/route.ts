import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyTeacherToken } from "@/lib/mobile-auth";
import { formatTeacherName } from "@/lib/teacherName";

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
      .select({ id: users.id, name: users.name, email: users.email, phone: users.phone, photoUrl: users.photoUrl, jenisKelamin: users.jenisKelamin })
      .from(users)
      .where(eq(users.id, teacherId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    const teacher = { ...result[0], name: formatTeacherName(result[0].name, result[0].jenisKelamin) };
    return NextResponse.json({ success: true, data: teacher });
  } catch (error: any) {
    console.error("API Teacher Me Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { token, photo_url } = body;

  if (!token) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 400 });
  }

  const payload = verifyTeacherToken(token);
  const teacherId = payload ? Number(payload.userId) : null;

  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }

  try {
    const result = await db
      .update(users)
      .set({ photoUrl: photo_url || null })
      .where(eq(users.id, teacherId))
      .returning({ id: users.id, name: users.name, email: users.email, phone: users.phone, photoUrl: users.photoUrl });

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("API Teacher Me Patch Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
