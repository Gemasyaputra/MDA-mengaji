import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, memorizationRecords, masterSurahs } from "@/lib/schema";
import { eq, ilike } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, teacherId, surahName, verseStart, verseEnd, status, quality, notes } = body;

    if (!slug || !teacherId || !surahName || !verseStart || !verseEnd) {
      return NextResponse.json({ success: false, message: "Data hafalan tidak lengkap." }, { status: 400 });
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

    // 2. Cari ID Surah berdasarkan teks (Fuzzy search)
    let surahId = 1; // Default fallback (Al-Fatihah misalnya)
    const surahResult = await db
      .select()
      .from(masterSurahs)
      .where(ilike(masterSurahs.nameLatin, `%${surahName}%`))
      .limit(1);
      
    if (surahResult.length > 0) {
      surahId = surahResult[0].id;
    }

    // 3. Simpan data hafalan
    const newRecord = await db.insert(memorizationRecords).values({
      studentId: student.id,
      teacherId: teacherId, 
      surahId: surahId,
      verseStart: parseInt(verseStart),
      verseEnd: parseInt(verseEnd),
      status: status || "LANCAR", // "LANCAR" atau "MENGULANG"
      quality: quality || "B",
      notes: notes || "",
      date: new Date().toISOString().split('T')[0],
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Hafalan berhasil dicatat",
      data: newRecord[0]
    });

  } catch (error: any) {
    console.error("API Memorization Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
