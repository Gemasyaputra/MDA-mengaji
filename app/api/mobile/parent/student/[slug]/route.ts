import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, attendance, learningRecords, memorizationRecords, worshipRecords } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ success: false, message: "Kode santri (SLUG) tidak valid." }, { status: 400 });
    }

    // 1. Ambil data santri
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.slug, slug))
      .limit(1);

    if (studentResult.length === 0) {
      return NextResponse.json({ success: false, message: "Data santri tidak ditemukan." }, { status: 404 });
    }

    const student = studentResult[0];

    // 2. Ambil data presensi terakhir (hari ini/terbaru)
    const latestAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.studentId, student.id))
      .orderBy(desc(attendance.date))
      .limit(1);

    // 3. Ambil data ngaji terakhir
    const latestLearning = await db
      .select()
      .from(learningRecords)
      .where(eq(learningRecords.studentId, student.id))
      .orderBy(desc(learningRecords.date))
      .limit(1);
      
    // 4. Ambil data hafalan terakhir
    const latestMemorization = await db
      .select()
      .from(memorizationRecords)
      .where(eq(memorizationRecords.studentId, student.id))
      .orderBy(desc(memorizationRecords.date))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          readingLevel: student.readingLevel,
          currentLevel: student.currentLevel,
        },
        latestAttendance: latestAttendance.length > 0 ? latestAttendance[0] : null,
        latestLearning: latestLearning.length > 0 ? latestLearning[0] : null,
        latestMemorization: latestMemorization.length > 0 ? latestMemorization[0] : null,
      }
    });

  } catch (error: any) {
    console.error("Parent Student API Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
