import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { resolveTeacherId } from "@/lib/mobile-auth";
import { applyTeacherNameFormatting } from "@/lib/teacherName";

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
    // We want to group by date and group_id. total_students is the group's full roster
    // size (constant per group, not just the students who happen to have a record that
    // day) so the UI can show "3/5 hadir" against the real class size.
    let baseSql = sql`
        SELECT
            TO_CHAR(a.date, 'YYYY-MM-DD') as date,
            a.session,
            COUNT(a.id) as total_attendance,
            SUM(CASE WHEN a.status = 'HADIR' THEN 1 ELSE 0 END) as total_hadir,
            SUM(CASE WHEN a.status = 'ALFA' THEN 1 ELSE 0 END) as total_alfa,
            SUM(CASE WHEN a.status = 'SAKIT' THEN 1 ELSE 0 END) as total_sakit,
            SUM(CASE WHEN a.status = 'IZIN' THEN 1 ELSE 0 END) as total_izin,
            MAX(g.name) as group_name,
            MAX(u.name) as teacher_name,
            MAX(u.jenis_kelamin) as teacher_jenis_kelamin,
            s.group_id,
            (SELECT COUNT(*) FROM students WHERE group_id = s.group_id) as total_students
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

    baseSql = sql`${baseSql} GROUP BY a.date, a.session, s.group_id, a.teacher_id ORDER BY a.date DESC, a.session ASC LIMIT 200`;

    const result = await db.execute(baseSql);
    const rows = applyTeacherNameFormatting((result.rows ?? []) as any[]);

    // Group session-level rows into one entry per date+kelas, with each session's
    // counts nested as "detail keterangan" instead of one card per session. Keyed by
    // date+group_id (not just date) so two classes recorded on the same day don't get
    // blended into one bucket.
    const byDateGroup = new Map<string, any>();
    for (const row of rows as any[]) {
      const rowAttendance = Number(row.total_attendance || 0);
      const rowHadir = Number(row.total_hadir || 0);
      const key = `${row.date}_${row.group_id}`;
      let day = byDateGroup.get(key);
      if (!day) {
        day = {
          date: row.date,
          group_id: row.group_id,
          group_name: row.group_name,
          teacher_name: row.teacher_name,
          teacher_jenis_kelamin: row.teacher_jenis_kelamin,
          total_students: Number(row.total_students || 0),
          total_attendance: 0,
          total_hadir: 0,
          total_alfa: 0,
          total_sakit: 0,
          total_izin: 0,
          sessions: [],
        };
        byDateGroup.set(key, day);
      }
      day.total_attendance += rowAttendance;
      day.total_hadir += rowHadir;
      day.total_alfa += Number(row.total_alfa || 0);
      day.total_sakit += Number(row.total_sakit || 0);
      day.total_izin += Number(row.total_izin || 0);
      day.sessions.push({
        session: row.session,
        total_attendance: rowAttendance,
        total_hadir: rowHadir,
      });
    }

    const data = Array.from(byDateGroup.values()).sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API Attendance History Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server: " + error?.message }, { status: 500 });
  }
}
