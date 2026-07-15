import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyGroups, students } from "@/lib/schema";
import { eq, inArray, asc, and, sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get("token");
  const search = searchParams.get("search");

  const teacherId = resolveTeacherId(tokenParam);
  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Missing or invalid token" }, { status: 401 });
  }

  try {
    const classes = await db
      .select({ id: studyGroups.id, name: studyGroups.name })
      .from(studyGroups)
      .where(eq(studyGroups.teacherId, teacherId));

    if (classes.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const classIds = classes.map((c) => c.id);
    const groupNameById = new Map(classes.map((c) => [c.id, c.name]));

    const whereClause = search && search.trim()
      ? and(inArray(students.groupId, classIds), sql`LOWER(${students.name}) LIKE ${`%${search.trim().toLowerCase()}%`}`)
      : inArray(students.groupId, classIds);

    const groupStudents = await db
      .select({
        id: students.id,
        name: students.name,
        slug: students.slug,
        groupId: students.groupId,
        readingLevel: students.readingLevel,
        currentLevel: students.currentLevel,
        parentPhone: students.parentPhone,
      })
      .from(students)
      .where(whereClause)
      .orderBy(asc(students.name));

    const data = groupStudents.map((s) => ({
      ...s,
      groupName: s.groupId ? groupNameById.get(s.groupId) || null : null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API Teacher Students Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
