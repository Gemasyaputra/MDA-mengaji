import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, studyGroups, students, attendance } from "@/lib/schema";
import { eq, count, inArray, and, sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get("token");

  const teacherId = resolveTeacherId(tokenParam);
  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Missing or invalid token" }, { status: 401 });
  }

  try {
    // Get teacher info
    const teacherResult = await db.select({ name: users.name }).from(users).where(eq(users.id, teacherId)).limit(1);
    if (teacherResult.length === 0) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }
    
    const teacherName = teacherResult[0].name;

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
           presentToday: 0
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

    // Get present today in those classes
    // date in DB is stored as 'YYYY-MM-DD' or timestamp depending on how drizzle maps date(). 
    // Usually it's YYYY-MM-DD. We can use SQL to match today.
    const today = new Date().toISOString().split('T')[0];
    
    // We only want attendance for students in those classes, but since attendance has teacherId, 
    // we can just query by teacherId and date and status='hadir'
    const presentCountResult = await db
      .select({ count: count() })
      .from(attendance)
      .where(
         and(
           eq(attendance.teacherId, teacherId),
           sql`UPPER(${attendance.status}) = 'HADIR'`,
           sql`DATE(${attendance.date}) = CURRENT_DATE`
         )
      );
    const presentToday = presentCountResult[0].count;

    return NextResponse.json({
      success: true,
      data: {
        teacherName,
        totalClasses,
        totalStudents,
        presentToday
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
