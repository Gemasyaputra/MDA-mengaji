import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, worshipRecords } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/app/api/notifications/route";

const ALLOWED_TYPES = ['SALAT_FARDU', 'SALAT_SUNAH'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, type, prayer_name, is_completed, date, notes } = body;

    if (!slug) {
      return NextResponse.json({ success: false, message: "Kode santri (SLUG) tidak valid." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ success: false, message: "Jenis ibadah tidak valid. Orang tua hanya dapat mencatat Sholat Fardu/Sunah." }, { status: 400 });
    }
    if (!prayer_name) {
      return NextResponse.json({ success: false, message: "Nama sholat wajib diisi." }, { status: 400 });
    }

    const studentResult = await db
      .select({ id: students.id, name: students.name })
      .from(students)
      .where(eq(students.slug, slug))
      .limit(1);

    if (studentResult.length === 0) {
      return NextResponse.json({ success: false, message: "Data santri tidak ditemukan." }, { status: 404 });
    }
    const student = studentResult[0];

    const newRecord = await db.insert(worshipRecords).values({
      studentId: student.id,
      teacherId: null,
      recordedBy: 'PARENT',
      date: date || new Date().toISOString().split('T')[0],
      type,
      isCompleted: !!is_completed,
      quality: null,
      prayerName: prayer_name,
      notes: notes || null,
    }).returning();

    try {
      const status = is_completed ? 'Sudah' : 'Belum';
      await createNotification({
        type: 'worship',
        message: `Sholat ${prayer_name} untuk ${student.name} dicatat oleh orang tua — ${status} dikerjakan`,
      });
    } catch (e) {
      console.error('notif error:', e);
    }

    return NextResponse.json({ success: true, data: newRecord[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Parent Worship API Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
