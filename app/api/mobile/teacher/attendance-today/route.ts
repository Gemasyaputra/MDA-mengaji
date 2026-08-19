import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyGroups, students, attendance } from "@/lib/schema";
import { eq, or, and, inArray, asc, sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get("token");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD, client's local "today"

  const teacherId = resolveTeacherId(tokenParam);
  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Missing or invalid token" }, { status: 401 });
  }

  try {
    const classes = await db
      .select({ id: studyGroups.id, name: studyGroups.name })
      .from(studyGroups)
      .where(or(eq(studyGroups.teacherId, teacherId), eq(studyGroups.substituteTeacherId, teacherId)));

    if (classes.length === 0) {
      return NextResponse.json({ success: true, data: { classes: [] } });
    }

    const classIds = classes.map((c) => c.id);

    const classStudents = await db
      .select({ id: students.id, name: students.name, photoUrl: students.photoUrl, groupId: students.groupId })
      .from(students)
      .where(inArray(students.groupId, classIds))
      .orderBy(asc(students.name));

    const studentIds = classStudents.map((s) => s.id);

    const dateFilter = dateParam
      ? sql`DATE(${attendance.date}) = ${dateParam}::date`
      : sql`DATE(${attendance.date}) = CURRENT_DATE`;

    let todayAttendance: { studentId: number; session: string; status: string }[] = [];
    if (studentIds.length > 0) {
      todayAttendance = await db
        .select({ studentId: attendance.studentId, session: attendance.session, status: attendance.status })
        .from(attendance)
        .where(and(inArray(attendance.studentId, studentIds), dateFilter));
    }

    const classes_ = classes.map((c) => {
      const studentsInClass = classStudents.filter((s) => s.groupId === c.id);
      return {
        classId: c.id,
        className: c.name,
        students: studentsInClass.map((s) => {
          const records = todayAttendance.filter((a) => a.studentId === s.id);
          const sessions: Record<string, string | null> = { PAGI: null, SIANG: null, SORE: null };
          for (const r of records) {
            const key = String(r.session || "").toUpperCase();
            if (key in sessions) sessions[key] = String(r.status || "").toUpperCase();
          }
          return {
            id: s.id,
            name: s.name,
            photoUrl: s.photoUrl,
            sessions,
          };
        }),
      };
    });

    return NextResponse.json({ success: true, data: { classes: classes_ } });
  } catch (error: any) {
    console.error("Attendance today detail error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
