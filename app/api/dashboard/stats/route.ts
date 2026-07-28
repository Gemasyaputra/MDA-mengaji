import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacher_id');

  try {
    let santriQuery = 'SELECT COUNT(*) as count FROM students';
    let santriParams: any[] = [];
    
    let presentQuery = `
         SELECT COUNT(*) as count 
         FROM attendance a
         JOIN students s ON a.student_id = s.id
         WHERE a.date = CURRENT_DATE 
           AND a.status = 'HADIR'
    `;
    let presentParams: any[] = [];

    if (teacherId) {
      santriQuery = `
        SELECT COUNT(s.*) as count 
        FROM students s
        JOIN study_groups g ON s.group_id = g.id
        WHERE g.teacher_id = $1
      `;
      santriParams.push(teacherId);

      presentQuery = `
         SELECT COUNT(a.*) as count 
         FROM attendance a
         JOIN students s ON a.student_id = s.id
         JOIN study_groups g ON s.group_id = g.id
         WHERE g.teacher_id = $1
           AND a.date = CURRENT_DATE 
           AND a.status = 'HADIR'
      `;
      presentParams.push(teacherId);
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
          COALESCE((SELECT MAX(date) FROM learning_records WHERE student_id = s.id), '1900-01-01'),
          COALESCE((SELECT MAX(date) FROM memorization_records WHERE student_id = s.id), '1900-01-01')
        ) as last_activity_date
      ) la ON true
      WHERE la.last_activity_date < CURRENT_DATE - INTERVAL '14 days'
    `;
    let behindParams: any[] = [];
    if (teacherId) {
      behindQuery = `
        SELECT COUNT(*) as count FROM students s
        JOIN study_groups g ON s.group_id = g.id
        LEFT JOIN LATERAL (
          SELECT GREATEST(
            COALESCE((SELECT MAX(date) FROM learning_records WHERE student_id = s.id), '1900-01-01'),
            COALESCE((SELECT MAX(date) FROM memorization_records WHERE student_id = s.id), '1900-01-01')
          ) as last_activity_date
        ) la ON true
        WHERE g.teacher_id = $1 AND la.last_activity_date < CURRENT_DATE - INTERVAL '14 days'
      `;
      behindParams.push(teacherId);
    }

    // Run all queries in parallel using Promise.all to improve loading speed
    const [totalSantriResult, presentTodayResult, totalTeachersResult, totalGroupsResult, studentsBehindResult] = await Promise.all([
      // Count Total Santri
      query(santriQuery, santriParams),

      // Count Present Today
      query(presentQuery, presentParams),

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

    return NextResponse.json({
        success: true,
        data: {
            total_santri: totalSantri,
            present_today: presentToday,
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
