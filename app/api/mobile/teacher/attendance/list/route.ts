import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyGroups, students, attendance } from "@/lib/schema";
import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get("token");
  const groupIdParam = searchParams.get("groupId");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD
  const sessionParamRaw = searchParams.get("session");
  const sessionParam = sessionParamRaw === "SIANG" ? "SIANG" : sessionParamRaw === "SORE" ? "SORE" : "PAGI";

  const teacherId = resolveTeacherId(tokenParam);
  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Missing or invalid token" }, { status: 401 });
  }

  try {
    // If groupId is not provided, return the list of classes for this teacher
    if (!groupIdParam) {
      const classes = await db
        .select({ id: studyGroups.id, name: studyGroups.name })
        .from(studyGroups)
        .where(eq(studyGroups.teacherId, teacherId));
      
      return NextResponse.json({ success: true, data: classes });
    }

    // If groupId is provided, return the students and their attendance for the given date
    const groupId = parseInt(groupIdParam, 10);
    const dateStr = dateParam || new Date().toISOString().split('T')[0];

    // Fetch all students in the group
    const groupStudents = await db
      .select({
          id: students.id,
          name: students.name,
          readingLevel: students.readingLevel,
          currentLevel: students.currentLevel,
          photoUrl: students.photoUrl
      })
      .from(students)
      .where(eq(students.groupId, groupId))
      .orderBy(asc(students.name));

    // Fetch existing attendance for this group and date, across ALL sessions (not just the
    // active one) so we can also tell the teacher a student was already recorded in another
    // session today.
    // Note: Drizzle might return Date objects or strings for date field, we'll cast to string if needed
    const studentIds = groupStudents.map(s => s.id);

    let allAttendanceToday: any[] = [];
    if (studentIds.length > 0) {
      allAttendanceToday = await db
        .select()
        .from(attendance)
        .where(
          and(
            inArray(attendance.studentId, studentIds),
            eq(sql`date::date`, sql`${dateStr}::date`)
          )
        );
    }

    // Merge students with attendance
    const mergedData = groupStudents.map(s => {
      const evidence = allAttendanceToday.find((a: any) => a.studentId === s.id && a.session === sessionParam);
      const otherSessions = allAttendanceToday
        .filter((a: any) => a.studentId === s.id && a.session !== sessionParam)
        .map((a: any) => ({ session: a.session, status: a.status }));
      return {
        id: s.id,
        name: s.name,
        readingLevel: s.readingLevel,
        currentLevel: s.currentLevel,
        photoUrl: s.photoUrl,
        status: evidence ? evidence.status : null, // Belum ditandai sampai guru memilih status
        notes: evidence ? evidence.notes : '',
        time: evidence ? evidence.time : '',
        otherSessions,
      };
    });

    return NextResponse.json({ success: true, data: mergedData });
  } catch (error: any) {
    console.error("API Attendance List Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
