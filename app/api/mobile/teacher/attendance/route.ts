import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, attendance } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, teacherId, status, notes } = body;

    if (!slug || !teacherId || !status) {
      return NextResponse.json({ success: false, message: "Data absensi tidak lengkap (slug, teacherId, status dibutuhkan)." }, { status: 400 });
    }

    // 1. Cari santri berdasarkan slug yang di-scan dari QR
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.slug, slug))
      .limit(1);

    if (studentResult.length === 0) {
      return NextResponse.json({ success: false, message: "QR Code tidak dikenali. Santri tidak ditemukan." }, { status: 404 });
    }

    const student = studentResult[0];

    // 2. Cek apakah santri ini sudah diabsen hari ini oleh guru yang sama (opsional, untuk mencegah double scan)
    // Untuk saat ini kita langsung masukkan data baru saja agar sederhana.

    // 3. Simpan data absensi
    const newAttendance = await db.insert(attendance).values({
      studentId: student.id,
      teacherId: teacherId, // Dummy teacher id for now
      status: status.toUpperCase(), // "HADIR", "SAKIT", "IZIN"
      notes: notes || "Diabsen via QR Code Mobile",
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD string
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dicatat",
      data: {
        studentName: student.name,
        attendanceId: newAttendance[0].id
      }
    });

  } catch (error: any) {
    console.error("API Attendance Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
