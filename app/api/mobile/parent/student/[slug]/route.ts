import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  students,
  attendance,
  learningRecords,
  memorizationRecords,
  worshipRecords,
  masterSurahs,
  masterDailyPrayers,
  masterPrayerReadings,
} from "@/lib/schema";
import { eq, desc, and, count, sql } from "drizzle-orm";

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

    // 4. Ambil data hafalan (tahfidz) terakhir, sertakan nama surah
    const latestMemorizationResult = await db
      .select({
        id: memorizationRecords.id,
        date: memorizationRecords.date,
        surahId: memorizationRecords.surahId,
        surahName: masterSurahs.nameLatin,
        verseStart: memorizationRecords.verseStart,
        verseEnd: memorizationRecords.verseEnd,
        status: memorizationRecords.status,
        quality: memorizationRecords.quality,
        notes: memorizationRecords.notes,
      })
      .from(memorizationRecords)
      .leftJoin(masterSurahs, eq(memorizationRecords.surahId, masterSurahs.id))
      .where(eq(memorizationRecords.studentId, student.id))
      .orderBy(desc(memorizationRecords.date))
      .limit(1);

    // 5. Ambil data ibadah (doa harian / bacaan sholat) terakhir, sertakan judul
    const latestWorshipResult = await db
      .select({
        id: worshipRecords.id,
        date: worshipRecords.date,
        type: worshipRecords.type,
        dailyPrayerTitle: masterDailyPrayers.title,
        prayerReadingTitle: masterPrayerReadings.title,
        isCompleted: worshipRecords.isCompleted,
        quality: worshipRecords.quality,
      })
      .from(worshipRecords)
      .leftJoin(masterDailyPrayers, eq(worshipRecords.dailyPrayerId, masterDailyPrayers.id))
      .leftJoin(masterPrayerReadings, eq(worshipRecords.prayerReadingId, masterPrayerReadings.id))
      .where(eq(worshipRecords.studentId, student.id))
      .orderBy(desc(worshipRecords.date))
      .limit(1);

    const latestWorshipRaw = latestWorshipResult.length > 0 ? latestWorshipResult[0] : null;
    const latestWorship = latestWorshipRaw
      ? {
          id: latestWorshipRaw.id,
          date: latestWorshipRaw.date,
          type: latestWorshipRaw.type,
          title:
            latestWorshipRaw.type === "BACAAN_SHOLAT"
              ? latestWorshipRaw.prayerReadingTitle
              : latestWorshipRaw.dailyPrayerTitle,
          isCompleted: latestWorshipRaw.isCompleted,
          quality: latestWorshipRaw.quality,
        }
      : null;

    // 6. Ringkasan kehadiran: sepanjang waktu & bulan berjalan
    const [attendanceTotal] = await db
      .select({
        total: count(),
        hadir: sql<number>`SUM(CASE WHEN UPPER(${attendance.status}) = 'HADIR' THEN 1 ELSE 0 END)`,
      })
      .from(attendance)
      .where(eq(attendance.studentId, student.id));

    const [attendanceThisMonth] = await db
      .select({
        total: count(),
        hadir: sql<number>`SUM(CASE WHEN UPPER(${attendance.status}) = 'HADIR' THEN 1 ELSE 0 END)`,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, student.id),
          sql`DATE(${attendance.date}) >= DATE_TRUNC('month', CURRENT_DATE)`
        )
      );

    const toPercentage = (hadir: number, total: number) =>
      total > 0 ? Math.round((hadir / total) * 100) : 0;

    const totalSessions = Number(attendanceTotal?.total ?? 0);
    const totalHadir = Number(attendanceTotal?.hadir ?? 0);
    const thisMonthSessions = Number(attendanceThisMonth?.total ?? 0);
    const thisMonthHadir = Number(attendanceThisMonth?.hadir ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          parentName: student.parentName,
          readingLevel: student.readingLevel,
          currentLevel: student.currentLevel,
        },
        latestAttendance: latestAttendance.length > 0 ? latestAttendance[0] : null,
        latestLearning: latestLearning.length > 0 ? latestLearning[0] : null,
        latestMemorization: latestMemorizationResult.length > 0 ? latestMemorizationResult[0] : null,
        latestWorship,
        attendanceSummary: {
          totalSessions,
          totalHadir,
          percentage: toPercentage(totalHadir, totalSessions),
          thisMonthSessions,
          thisMonthHadir,
          thisMonthPercentage: toPercentage(thisMonthHadir, thisMonthSessions),
        },
      }
    });

  } catch (error: any) {
    console.error("Parent Student API Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
