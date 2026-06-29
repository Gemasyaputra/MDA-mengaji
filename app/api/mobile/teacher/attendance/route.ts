import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, attendance } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const records = Array.isArray(body) ? body : [body];
    
    if (records.length === 0) {
        return NextResponse.json({ success: false, message: "Tidak ada data yang dikirim" }, { status: 400 });
    }

    // Validation
    if (!records[0].studentId || !records[0].teacherId || !records[0].status) {
         return NextResponse.json({ success: false, message: "Format data salah, membutuhkan studentId, teacherId, status" }, { status: 400 });
    }
    
    const dateStr = records[0].date || new Date().toISOString().split('T')[0];
    let successCount = 0;
    
    // Process each record (delete existing for that date then insert)
    for (const r of records) {
      // Drizzle ORM equivalent of deleting existing attendance for student on this date
      await db.execute(
        `DELETE FROM attendance WHERE student_id = $1 AND date::date = $2::date`,
        [r.studentId, dateStr]
      );
      
      await db.insert(attendance).values({
        studentId: r.studentId,
        teacherId: r.teacherId,
        status: r.status.toUpperCase(),
        notes: r.notes || "Diabsen via Mobile App",
        date: dateStr,
      });
      successCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dicatat",
      count: successCount
    });

  } catch (error: any) {
    console.error("API Attendance Bulk Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
