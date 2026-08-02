import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, studyGroups, students, attendance } from "@/lib/schema";
import { eq, count, countDistinct, inArray, and, sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";
import { formatTeacherName } from "@/lib/teacherName";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get("token");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD, client's local "today"

  const teacherId = resolveTeacherId(tokenParam);
  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Missing or invalid token" }, { status: 401 });
  }

  try {
    // Get teacher info
    const teacherResult = await db.select({ name: users.name, jenisKelamin: users.jenisKelamin }).from(users).where(eq(users.id, teacherId)).limit(1);
    if (teacherResult.length === 0) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    const teacherName = formatTeacherName(teacherResult[0].name, teacherResult[0].jenisKelamin);

    // Get classes handled by this teacher
    const classes = await db
      .select({ id: studyGroups.id, name: studyGroups.name })
      .from(studyGroups)
      .where(eq(studyGroups.teacherId, teacherId));

    const totalClasses = classes.length;
    
    if (totalClasses === 0) {
       return NextResponse.json({
         success: true,
         data: {
           teacherName,
           totalClasses: 0,
           totalStudents: 0,
           presentToday: 0,
           presentPagi: 0,
           presentSiang: 0,
           presentSore: 0
         }
       });
    }

    const classIds = classes.map(c => c.id);

    // Get total students in those classes
    const studentCountResult = await db
      .select({ count: count() })
      .from(students)
      .where(inArray(students.groupId, classIds));
    const totalStudents = studentCountResult[0].count;

    // Get present today in those classes. The client sends its own local calendar date
    // (device timezone) since relying on the DB server's CURRENT_DATE causes a mismatch
    // for WIB/WITA/WIT users when the UTC day hasn't rolled over yet.
    const dateFilter = dateParam
      ? sql`DATE(${attendance.date}) = ${dateParam}::date`
      : sql`DATE(${attendance.date}) = CURRENT_DATE`;

    // We only want attendance for students in those classes, but since attendance has teacherId,
    // we can just query by teacherId and date and status='hadir'
    // Distinct students present in at least one session (not sum of session records,
    // which would double count a student who attended more than one session in a day).
    const presentCountResult = await db
      .select({ count: countDistinct(attendance.studentId) })
      .from(attendance)
      .where(
         and(
           eq(attendance.teacherId, teacherId),
           sql`UPPER(${attendance.status}) = 'HADIR'`,
           dateFilter
         )
      );
    const presentToday = presentCountResult[0].count;

    // Present today broken down by session (PAGI/SIANG/SORE)
    const presentBySessionResult = await db
      .select({ session: attendance.session, count: count() })
      .from(attendance)
      .where(
         and(
           eq(attendance.teacherId, teacherId),
           sql`UPPER(${attendance.status}) = 'HADIR'`,
           dateFilter
         )
      )
      .groupBy(attendance.session);

    const presentBySession = { PAGI: 0, SIANG: 0, SORE: 0 };
    for (const row of presentBySessionResult) {
      const key = String(row.session || '').toUpperCase();
      if (key in presentBySession) {
        presentBySession[key as keyof typeof presentBySession] = Number(row.count);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        teacherName,
        totalClasses,
        totalStudents,
        presentToday,
        presentPagi: presentBySession.PAGI,
        presentSiang: presentBySession.SIANG,
        presentSore: presentBySession.SORE,
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
