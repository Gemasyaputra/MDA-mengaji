import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyGroups, students, attendance } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherIdParam = searchParams.get("teacherId");
  const groupIdParam = searchParams.get("groupId");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD

  if (!teacherIdParam) {
    return NextResponse.json({ success: false, message: "Missing teacherId" }, { status: 400 });
  }

  const teacherId = parseInt(teacherIdParam, 10);

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
      .select({ id: students.id, name: students.name })
      .from(students)
      .where(eq(students.groupId, groupId))
      .orderBy(asc(students.name));

    // Fetch existing attendance for this group and date
    // Note: Drizzle might return Date objects or strings for date field, we'll cast to string if needed
    const studentIds = groupStudents.map(s => s.id);
    
    // We can fetch attendance for all these students on this date
    // A simple way is to fetch all attendance for the teacher on this date and filter, or just query by studentIds.
    // Drizzle's `inArray` can be used if studentIds is not empty
    let existingAttendance: any[] = [];
    if (studentIds.length > 0) {
      // In PostgreSQL, to compare dates reliably:
      const atts = await db.execute(
        `SELECT student_id, status, notes, id as attendance_id FROM attendance WHERE student_id = ANY($1) AND date::date = $2::date`,
        [studentIds, dateStr]
      );
      existingAttendance = atts.rows || [];
    }

    // Merge students with attendance
    const mergedData = groupStudents.map(s => {
      const evidence = existingAttendance.find((a: any) => a.student_id === s.id);
      return {
        id: s.id,
        name: s.name,
        status: evidence ? evidence.status : 'HADIR', // Default to HADIR
        notes: evidence ? evidence.notes : '',
      };
    });

    return NextResponse.json({ success: true, data: mergedData });
  } catch (error: any) {
    console.error("API Attendance List Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
