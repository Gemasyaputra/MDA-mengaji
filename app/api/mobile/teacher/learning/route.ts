import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, learningRecords } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, token, type, levelOrSurah, startPoint, endPoint, quality, notes } = body;

    if (!slug || !token || !type || !levelOrSurah || !startPoint || !endPoint) {
      return NextResponse.json({ success: false, message: "Data nilai ngaji tidak lengkap." }, { status: 400 });
    }

    const teacherId = resolveTeacherId(token);
    if (!teacherId) {
      return NextResponse.json({ success: false, message: "Sesi guru tidak valid." }, { status: 401 });
    }

    // 1. Cari santri berdasarkan slug
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.slug, slug))
      .limit(1);

    if (studentResult.length === 0) {
      return NextResponse.json({ success: false, message: "QR Code atau Santri tidak ditemukan." }, { status: 404 });
    }

    const student = studentResult[0];

    // 2. Simpan data ngaji
    const newRecord = await db.insert(learningRecords).values({
      studentId: student.id,
      teacherId: teacherId, 
      type: type, // "IQRO" atau "ALQURAN"
      levelOrSurah: levelOrSurah,
      startPoint: startPoint,
      endPoint: endPoint,
      quality: quality || "B",
      notes: notes || "",
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Nilai ngaji berhasil disimpan",
      data: newRecord[0]
    });

  } catch (error: any) {
    console.error("API Learning Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
