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

    // Run all queries in parallel using Promise.all to improve loading speed
    const [totalSantriResult, presentTodayResult, totalTeachersResult, totalGroupsResult] = await Promise.all([
      // Count Total Santri
      query(santriQuery, santriParams),
      
      // Count Present Today
      query(presentQuery, presentParams),

      // Count Teachers (only role teacher)
      query(teacherQuery, ['teacher']),

      // Count Groups
      query(groupQuery, groupParams)
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

    const mosqueName = 'MDA Masjid Nurul Huda';

    return NextResponse.json({
        success: true,
        data: {
            total_santri: totalSantri,
            present_today: presentToday,
            total_teachers: totalTeachers,
            total_groups: totalGroups,
            mosque_name: mosqueName
        }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
