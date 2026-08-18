import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, attendance } from "@/lib/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const records = Array.isArray(body) ? body : [body];

    if (records.length === 0) {
        return NextResponse.json({ success: false, message: "Tidak ada data yang dikirim" }, { status: 400 });
    }

    // Validation — record penghapusan (action: 'delete') tidak butuh status.
    if (!records[0].studentId || !records[0].token || (records[0].action !== 'delete' && !records[0].status)) {
         return NextResponse.json({ success: false, message: "Format data salah, membutuhkan studentId, token, status" }, { status: 400 });
    }

    const resolvedTeacherId = resolveTeacherId(records[0].token);

    if (!resolvedTeacherId) {
        return NextResponse.json({ success: false, message: "Gagal memvalidasi token guru" }, { status: 401 });
    }

    const dateStr = records[0].date || new Date().toISOString().split('T')[0];
    let successCount = 0;
    const skipped: number[] = [];
    const deleted: number[] = [];

    // Record dengan action 'delete' diproses terpisah: hapus presensi santri untuk tanggal
    // ini (apapun sesinya) supaya bisa diinput ulang dengan benar, tanpa terkena lock sesi.
    const deleteRecords = records.filter((r: any) => r.action === 'delete');
    const insertRecords = records.filter((r: any) => r.action !== 'delete');

    for (const r of deleteRecords) {
      await db.delete(attendance).where(
        and(
          eq(attendance.studentId, r.studentId),
          eq(sql`date::date`, sql`${dateStr}::date`)
        )
      );
      deleted.push(r.studentId);
    }

    // Satu santri hanya boleh punya satu sesi presensi per hari. Ambil dulu semua presensi
    // yang sudah ada hari ini untuk santri-santri di payload, supaya bisa mengunci sesi lain.
    const studentIds = [...new Set(insertRecords.map((r: any) => r.studentId))];
    const existingToday = studentIds.length > 0
      ? await db
          .select({ studentId: attendance.studentId, session: attendance.session })
          .from(attendance)
          .where(
            and(
              inArray(attendance.studentId, studentIds),
              eq(sql`date::date`, sql`${dateStr}::date`)
            )
          )
      : [];

    const existingSessionByStudent = new Map<number, string>();
    for (const row of existingToday) {
      existingSessionByStudent.set(row.studentId, row.session);
    }

    // Process each record (delete existing for that date+session then insert)
    for (const r of insertRecords) {
      const session = r.session === 'SIANG' ? 'SIANG' : r.session === 'SORE' ? 'SORE' : 'PAGI';

      const lockedSession = existingSessionByStudent.get(r.studentId);
      if (lockedSession && lockedSession !== session) {
        // Santri ini sudah tercatat di sesi lain hari ini — kunci, jangan buat row dobel.
        skipped.push(r.studentId);
        continue;
      }

      // Drizzle ORM equivalent of deleting existing attendance for student on this date+session
      await db.delete(attendance).where(
        and(
          eq(attendance.studentId, r.studentId),
          eq(sql`date::date`, sql`${dateStr}::date`),
          eq(attendance.session, session)
        )
      );

      await db.insert(attendance).values({
        studentId: r.studentId,
        teacherId: resolvedTeacherId,
        status: r.status.toUpperCase(),
        session,
        time: r.time || null,
        notes: r.notes || "Diabsen via Mobile App",
        date: dateStr,
      });
      successCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dicatat",
      count: successCount,
      skipped,
      deleted,
    });

  } catch (error: any) {
    console.error("API Attendance Bulk Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
