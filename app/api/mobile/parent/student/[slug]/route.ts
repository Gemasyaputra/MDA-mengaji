import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  students,
  attendance,
  learningRecords,
  worshipRecords,
  masterDailyPrayers,
  masterPrayerReadings,
} from "@/lib/schema";
import { eq, desc, and, count, sql, inArray } from "drizzle-orm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ success: false, message: "Kode santri (SLUG) tidak valid." }, { status: 400 });
    }

    // Mitigasi enumerasi/brute-force slug: endpoint ini tidak memakai token
    // sesi, jadi batasi percobaan per IP per slug.
    const ip = getClientIp(req);
    const perSlug = rateLimit(`parent-student:${ip}:${slug}`, 10, 60_000);
    const perIp = rateLimit(`parent-student-ip:${ip}`, 30, 60_000);
    if (!perSlug.allowed || !perIp.allowed) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan. Coba lagi dalam beberapa saat." },
        { status: 429 }
      );
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

    // 4. Ambil data Hafalan (Doa Harian / Bacaan Sholat) terakhir, sertakan judul
    const latestHafalanResult = await db
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
      .where(and(eq(worshipRecords.studentId, student.id), inArray(worshipRecords.type, ['DOA_HARIAN', 'BACAAN_SHOLAT'])))
      .orderBy(desc(worshipRecords.date))
      .limit(1);

    const latestHafalanRaw = latestHafalanResult.length > 0 ? latestHafalanResult[0] : null;
    const latestHafalan = latestHafalanRaw
      ? {
          id: latestHafalanRaw.id,
          date: latestHafalanRaw.date,
          type: latestHafalanRaw.type,
          title:
            latestHafalanRaw.type === "BACAAN_SHOLAT"
              ? latestHafalanRaw.prayerReadingTitle
              : latestHafalanRaw.dailyPrayerTitle,
          isCompleted: latestHafalanRaw.isCompleted,
          quality: latestHafalanRaw.quality,
        }
      : null;

    // 5. Ambil data Ibadah (Salat Fardu / Sunah) terakhir
    const latestIbadahResult = await db
      .select({
        id: worshipRecords.id,
        date: worshipRecords.date,
        type: worshipRecords.type,
        prayerName: worshipRecords.prayerName,
      })
      .from(worshipRecords)
      .where(and(eq(worshipRecords.studentId, student.id), inArray(worshipRecords.type, ['SALAT_FARDU', 'SALAT_SUNAH'])))
      .orderBy(desc(worshipRecords.date))
      .limit(1);

    const latestIbadah = latestIbadahResult.length > 0 ? latestIbadahResult[0] : null;

    // 5b. Cek apakah santri tertinggal (tidak ada setoran mengaji/hafalan 14 hari terakhir)
    const behindCheck = await db.execute(sql`
      SELECT GREATEST(
        COALESCE((SELECT MAX(date) FROM learning_records WHERE student_id = ${student.id}), '1900-01-01'),
        COALESCE((SELECT MAX(date) FROM memorization_records WHERE student_id = ${student.id}), '1900-01-01')
      ) < CURRENT_DATE - INTERVAL '14 days' as is_behind
    `);
    const isBehind = Boolean((behindCheck.rows[0] as any)?.is_behind);

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
          photoUrl: student.photoUrl,
          isBehind,
          teacherNote: student.teacherNote,
        },
        latestAttendance: latestAttendance.length > 0 ? latestAttendance[0] : null,
        latestLearning: latestLearning.length > 0 ? latestLearning[0] : null,
        latestHafalan,
        latestIbadah,
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
