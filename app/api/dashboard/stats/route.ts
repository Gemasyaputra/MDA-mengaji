import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacher_id');
  // Client's local calendar date (device timezone). Falls back to the DB server's
  // CURRENT_DATE when absent, but that mismatches WIB/WITA/WIT users whenever the
  // UTC day hasn't rolled over yet, so callers should always send this.
  const dateParam = searchParams.get('date');
  const dateCondition = dateParam ? 'a.date = $DATE_PARAM::date' : 'a.date = CURRENT_DATE';

  try {
    let santriQuery = 'SELECT COUNT(*) as count FROM students';
    let santriParams: any[] = [];

    // Present today = distinct students present in at least one session (not sum of session records,
    // which would double count a student who attended more than one session in a day).
    let presentQuery = `
         SELECT COUNT(DISTINCT a.student_id) as count
         FROM attendance a
         JOIN students s ON a.student_id = s.id_students
         WHERE ${dateCondition.replace('$DATE_PARAM', '$1')}
           AND a.status = 'HADIR'
    `;
    let presentParams: any[] = dateParam ? [dateParam] : [];

    // Present today, broken down by session (PAGI/SIANG/SORE)
    let presentBySessionQuery = `
         SELECT a.session, COUNT(*) as count
         FROM attendance a
         JOIN students s ON a.student_id = s.id_students
         WHERE ${dateCondition.replace('$DATE_PARAM', '$1')}
           AND a.status = 'HADIR'
         GROUP BY a.session
    `;
    let presentBySessionParams: any[] = dateParam ? [dateParam] : [];

    if (teacherId) {
      santriQuery = `
        SELECT COUNT(s.*) as count
        FROM students s
        JOIN study_groups g ON s.group_id = g.id_study_groups
        WHERE g.teacher_id = $1
      `;
      santriParams.push(teacherId);

      const teacherDateCondition = dateParam ? 'a.date = $2::date' : 'a.date = CURRENT_DATE';

      presentQuery = `
         SELECT COUNT(DISTINCT a.student_id) as count
         FROM attendance a
         JOIN students s ON a.student_id = s.id_students
         JOIN study_groups g ON s.group_id = g.id_study_groups
         WHERE g.teacher_id = $1
           AND ${teacherDateCondition}
           AND a.status = 'HADIR'
      `;
      presentParams = dateParam ? [teacherId, dateParam] : [teacherId];

      presentBySessionQuery = `
         SELECT a.session, COUNT(*) as count
         FROM attendance a
         JOIN students s ON a.student_id = s.id_students
         JOIN study_groups g ON s.group_id = g.id_study_groups
         WHERE g.teacher_id = $1
           AND ${teacherDateCondition}
           AND a.status = 'HADIR'
         GROUP BY a.session
      `;
      presentBySessionParams = dateParam ? [teacherId, dateParam] : [teacherId];
    }

    // New Queries for more stats
    let teacherQuery = 'SELECT COUNT(*) as count FROM users WHERE role = $1';
    let groupQuery = 'SELECT COUNT(*) as count FROM study_groups';
    let groupParams: any[] = [];

    if (teacherId) {
       groupQuery += ' WHERE teacher_id = $1';
       groupParams.push(teacherId);
    }

    // Count students behind target (no learning/memorization record in last 14 days)
    let behindQuery = `
      SELECT COUNT(*) as count FROM students s
      LEFT JOIN LATERAL (
        SELECT GREATEST(
          COALESCE((SELECT MAX(date) FROM learning_records WHERE student_id = s.id_students), '1900-01-01'),
          COALESCE((SELECT MAX(date) FROM memorization_records WHERE student_id = s.id_students), '1900-01-01')
        ) as last_activity_date
      ) la ON true
      WHERE la.last_activity_date < CURRENT_DATE - INTERVAL '14 days'
    `;
    let behindParams: any[] = [];
    if (teacherId) {
      behindQuery = `
        SELECT COUNT(*) as count FROM students s
        JOIN study_groups g ON s.group_id = g.id_study_groups
        LEFT JOIN LATERAL (
          SELECT GREATEST(
            COALESCE((SELECT MAX(date) FROM learning_records WHERE student_id = s.id_students), '1900-01-01'),
            COALESCE((SELECT MAX(date) FROM memorization_records WHERE student_id = s.id_students), '1900-01-01')
          ) as last_activity_date
        ) la ON true
        WHERE g.teacher_id = $1 AND la.last_activity_date < CURRENT_DATE - INTERVAL '14 days'
      `;
      behindParams.push(teacherId);
    }

    // Run all queries in parallel using Promise.all to improve loading speed
    const [totalSantriResult, presentTodayResult, presentBySessionResult, totalTeachersResult, totalGroupsResult, studentsBehindResult] = await Promise.all([
      // Count Total Santri
      query(santriQuery, santriParams),

      // Count Present Today
      query(presentQuery, presentParams),

      // Count Present Today per Session (PAGI/SIANG/SORE)
      query(presentBySessionQuery, presentBySessionParams),

      // Count Teachers (only role teacher)
      query(teacherQuery, ['teacher']),

      // Count Groups
      query(groupQuery, groupParams),

      // Count students behind target
      query(behindQuery, behindParams)
    ]);

    const totalSantri = totalSantriResult.success && totalSantriResult.data && totalSantriResult.data.length > 0 
        ? Number(totalSantriResult.data[0].count) 
        : 0;

    const presentToday = presentTodayResult.success && presentTodayResult.data && presentTodayResult.data.length > 0 
        ? Number(presentTodayResult.data[0].count) 
        : 0;
        
    const totalTeachers = totalTeachersResult.success && totalTeachersResult.data && totalTeachersResult.data.length > 0 
        ? Number(totalTeachersResult.data[0].count) 
        : 0;

    const totalGroups = totalGroupsResult.success && totalGroupsResult.data && totalGroupsResult.data.length > 0
        ? Number(totalGroupsResult.data[0].count)
        : 0;

    const studentsBehind = studentsBehindResult.success && studentsBehindResult.data && studentsBehindResult.data.length > 0
        ? Number(studentsBehindResult.data[0].count)
        : 0;

    const attendancePercentToday = totalSantri > 0
        ? Math.round((presentToday / totalSantri) * 100)
        : 0;

    const presentBySession = { PAGI: 0, SIANG: 0, SORE: 0 };
    if (presentBySessionResult.success && presentBySessionResult.data) {
        for (const row of presentBySessionResult.data) {
            const key = String(row.session || '').toUpperCase();
            if (key in presentBySession) {
                presentBySession[key as keyof typeof presentBySession] = Number(row.count);
            }
        }
    }

    return NextResponse.json({
        success: true,
        data: {
            total_santri: totalSantri,
            present_today: presentToday,
            present_pagi: presentBySession.PAGI,
            present_siang: presentBySession.SIANG,
            present_sore: presentBySession.SORE,
            attendance_percent_today: attendancePercentToday,
            total_teachers: totalTeachers,
            total_groups: totalGroups,
            students_behind: studentsBehind,
        }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
