import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get("token");
  const month = searchParams.get("month"); // YYYY-MM
  const groupId = searchParams.get("groupId");

  const teacherId = resolveTeacherId(tokenParam);
  if (!teacherId) {
    return NextResponse.json({ success: false, message: "Missing or invalid token" }, { status: 401 });
  }

  try {
    // We want to group by date and group_id
    let baseSql = sql`
        SELECT 
            TO_CHAR(a.date, 'YYYY-MM-DD') as date,
            COUNT(a.id) as total_attendance,
            SUM(CASE WHEN a.status = 'HADIR' THEN 1 ELSE 0 END) as total_hadir,
            MAX(g.name) as group_name,
            MAX(u.name) as teacher_name,
            s.group_id
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        LEFT JOIN study_groups g ON s.group_id = g.id
        LEFT JOIN users u ON a.teacher_id = u.id
        WHERE a.teacher_id = ${teacherId}
    `;

    if (month) {
        // month is YYYY-MM
        baseSql = sql`${baseSql} AND TO_CHAR(a.date, 'YYYY-MM') = ${month}`;
    }

    if (groupId) {
        baseSql = sql`${baseSql} AND s.group_id = ${parseInt(groupId, 10)}`;
    }

    baseSql = sql`${baseSql} GROUP BY a.date, s.group_id, a.teacher_id ORDER BY a.date DESC LIMIT 50`;

    const result = await db.execute(baseSql);

    return NextResponse.json({ success: true, data: result.rows ?? [] });
  } catch (error: any) {
    console.error("API Attendance History Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
