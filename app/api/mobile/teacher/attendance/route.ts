import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, attendance } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const records = Array.isArray(body) ? body : [body];
    
    if (records.length === 0) {
        return NextResponse.json({ success: false, message: "Tidak ada data yang dikirim" }, { status: 400 });
    }

    // Validation
    if (!records[0].studentId || (!records[0].teacherId && !records[0].token) || !records[0].status) {
         return NextResponse.json({ success: false, message: "Format data salah, membutuhkan studentId, teacherId/token, status" }, { status: 400 });
    }

    let resolvedTeacherId = records[0].teacherId;
    if (!resolvedTeacherId && records[0].token) {
        try {
            const decoded = Buffer.from(records[0].token, 'base64').toString('utf8');
            const payload = JSON.parse(decoded);
            resolvedTeacherId = payload.userId;
        } catch (e) {
            console.error("Token decode error in attendance POST", e);
        }
    }

    if (!resolvedTeacherId) {
        return NextResponse.json({ success: false, message: "Gagal memvalidasi token guru" }, { status: 401 });
    }
    
    const dateStr = records[0].date || new Date().toISOString().split('T')[0];
    let successCount = 0;
    
    // Process each record (delete existing for that date then insert)
    for (const r of records) {
      // Drizzle ORM equivalent of deleting existing attendance for student on this date
      await db.delete(attendance).where(
        and(
          eq(attendance.studentId, r.studentId),
          eq(sql`date::date`, sql`${dateStr}::date`)
        )
      );
      
      await db.insert(attendance).values({
        studentId: r.studentId,
        teacherId: resolvedTeacherId,
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
