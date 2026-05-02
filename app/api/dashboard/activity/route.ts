import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacher_id');
  const role = searchParams.get('role');
  const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 100);

  try {
    let activities: any[] = [];

    if (role === 'admin') {
      // ==================== ADMIN: Tampilkan semua aktivitas global ====================
      const result = await query(`
        SELECT * FROM (
          -- [1] Presensi kehadiran oleh siapapun (Admin view)
          SELECT
            'attendance' AS type,
            a.created_at AS ts,
            u.name AS actor_name,
            g.name AS group_name,
            NULL::text AS student_name,
            NULL::text AS detail,
            a.date AS activity_date
          FROM attendance a
          JOIN users u ON a.teacher_id = u.id
          JOIN students s ON a.student_id = s.id
          JOIN study_groups g ON s.group_id = g.id
          GROUP BY a.date, a.created_at, u.name, g.name, a.id

          UNION ALL

          -- [2] Setoran tilawah/iqro terbaru
          SELECT
            'learning' AS type,
            lr.created_at AS ts,
            u.name AS actor_name,
            g.name AS group_name,
            s.name AS student_name,
            lr.level_or_surah AS detail,
            lr.date AS activity_date
          FROM learning_records lr
          JOIN users u ON lr.teacher_id = u.id
          JOIN students s ON lr.student_id = s.id
          JOIN study_groups g ON s.group_id = g.id

          UNION ALL

          -- [3] Santri baru didaftarkan
          SELECT
            'new_student' AS type,
            s.created_at AS ts,
            'Admin' AS actor_name,
            g.name AS group_name,
            s.name AS student_name,
            NULL::text AS detail,
            s.created_at::date AS activity_date
          FROM students s
          JOIN study_groups g ON s.group_id = g.id

          UNION ALL

          -- [4] Khatam Iqro (pencapaian milestone)
          SELECT
            'milestone' AS type,
            s.iqro_graduated_at AS ts,
            u.name AS actor_name,
            g.name AS group_name,
            s.name AS student_name,
            'Khatam Iqro ke Al-Quran' AS detail,
            s.iqro_graduated_at::date AS activity_date
          FROM students s
          JOIN study_groups g ON s.group_id = g.id
          LEFT JOIN users u ON g.teacher_id = u.id
          WHERE s.iqro_graduated_at IS NOT NULL

        ) combined
        ORDER BY ts DESC NULLS LAST
        LIMIT ${limit}
      `);

      if (result.success && result.data) {
        activities = result.data;
      }

    } else if (role === 'teacher' && teacherId) {
      // ==================== TEACHER: Hanya aktivitas yang relevan ====================
      const result = await query(`
        SELECT * FROM (

          -- [1] Presensi yang dilakukan oleh guru ini sendiri
          -- Dikelompokkan per tanggal & kelompok (bukan per santri)
          SELECT DISTINCT ON (a.date, g.id)
            'attendance' AS type,
            MAX(a.created_at) OVER (PARTITION BY a.date, g.id) AS ts,
            u.name AS actor_name,
            g.name AS group_name,
            NULL::text AS student_name,
            NULL::text AS detail,
            a.date AS activity_date
          FROM attendance a
          JOIN users u ON a.teacher_id = u.id
          JOIN students s ON a.student_id = s.id
          JOIN study_groups g ON s.group_id = g.id
          WHERE a.teacher_id = $1

          UNION ALL

          -- [2] Setoran tilawah/iqro yang dicatat oleh guru ini
          SELECT
            'learning' AS type,
            lr.created_at AS ts,
            u.name AS actor_name,
            g.name AS group_name,
            s.name AS student_name,
            lr.level_or_surah AS detail,
            lr.date AS activity_date
          FROM learning_records lr
          JOIN users u ON lr.teacher_id = u.id
          JOIN students s ON lr.student_id = s.id
          JOIN study_groups g ON s.group_id = g.id
          WHERE lr.teacher_id = $1

          UNION ALL

          -- [3] Santri baru yang didaftarkan ke kelompok guru ini
          SELECT
            'new_student' AS type,
            s.created_at AS ts,
            'Admin' AS actor_name,
            g.name AS group_name,
            s.name AS student_name,
            NULL::text AS detail,
            s.created_at::date AS activity_date
          FROM students s
          JOIN study_groups g ON s.group_id = g.id
          WHERE g.teacher_id = $1

          UNION ALL

          -- [4] Khatam Iqro (milestone) santri di kelompok guru ini
          SELECT
            'milestone' AS type,
            s.iqro_graduated_at AS ts,
            u.name AS actor_name,
            g.name AS group_name,
            s.name AS student_name,
            'Khatam Iqro ke Al-Quran' AS detail,
            s.iqro_graduated_at::date AS activity_date
          FROM students s
          JOIN study_groups g ON s.group_id = g.id
          LEFT JOIN users u ON g.teacher_id = u.id
          WHERE g.teacher_id = $1
            AND s.iqro_graduated_at IS NOT NULL

        ) combined
        ORDER BY ts DESC NULLS LAST
        LIMIT ${limit}
      `, [teacherId]);

      if (result.success && result.data) {
        activities = result.data;
      }
    }

    return NextResponse.json({ success: true, data: activities });

  } catch (error: any) {
    console.error('Activity feed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
