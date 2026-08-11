import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/api-helpers';
import { createNotification } from '@/app/api/notifications/route';
import { applyTeacherNameFormatting, formatTeacherName } from '@/lib/teacherName';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
        student_id,
        teacher_id,
        date,
        type,
        daily_prayer_id,
        prayer_reading_id,
        is_completed,
        quality,
        prayer_name,
        notes
    } = body;

    const isSalatType = type === 'SALAT_FARDU' || type === 'SALAT_SUNAH';

    if (!student_id || !teacher_id || !type || (!isSalatType && !quality)) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'DOA_HARIAN' && !daily_prayer_id) {
         return NextResponse.json({ success: false, error: 'daily_prayer_id required for DOA_HARIAN' }, { status: 400 });
    }
    if (type === 'BACAAN_SHOLAT' && !prayer_reading_id) {
         return NextResponse.json({ success: false, error: 'prayer_reading_id required for BACAAN_SHOLAT' }, { status: 400 });
    }
    if (isSalatType && !prayer_name) {
         return NextResponse.json({ success: false, error: 'prayer_name required for SALAT_FARDU/SALAT_SUNAH' }, { status: 400 });
    }

    let qualityNum: number | null = null;
    if (!isSalatType) {
        qualityNum = Number(quality);
        if (!Number.isInteger(qualityNum) || qualityNum < 1 || qualityNum > 10) {
            return NextResponse.json({ success: false, error: 'Nilai harus berupa angka 1-10' }, { status: 400 });
        }
    }

    const result = await execute(
      `INSERT INTO worship_records (
          student_id, teacher_id, date, type,
          daily_prayer_id, prayer_reading_id,
          is_completed, quality, prayer_name, notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
          student_id,
          teacher_id,
          date || new Date().toLocaleDateString('en-CA'),
          type,
          daily_prayer_id || null,
          prayer_reading_id || null,
          is_completed || false,
          qualityNum,
          prayer_name || null,
          notes || null
      ]
    );

    if (result.success) {
      try {
        const infoResult = await query(`
          SELECT st.name as student_name, u.name as teacher_name, u.jenis_kelamin as teacher_jenis_kelamin,
                 mdp.title as prayer_title, mpr.title as reading_title
          FROM students st
          JOIN users u ON u.id_users = $2
          LEFT JOIN master_daily_prayers mdp ON mdp.id_master_daily_prayers = $3
          LEFT JOIN master_prayer_readings mpr ON mpr.id_master_prayer_readings = $4
          WHERE st.id_students = $1 LIMIT 1
        `, [student_id, teacher_id, daily_prayer_id || null, prayer_reading_id || null]);

        if (infoResult.data && infoResult.data.length > 0) {
          const { student_name, teacher_name, teacher_jenis_kelamin, prayer_title, reading_title } = infoResult.data[0];
          let itemName = type === 'DOA_HARIAN' ? (prayer_title || 'Doa Harian') : (reading_title || 'Bacaan Sholat');
          if (isSalatType) itemName = prayer_name || (type === 'SALAT_FARDU' ? 'Salat Fardu' : 'Salat Sunah');
          const status = is_completed ? 'Lulus' : 'Belum Lulus';
          const nilaiText = qualityNum ? ` (Nilai ${qualityNum})` : '';
          await createNotification({
            type: 'worship',
            message: `Hafalan ${student_name}: ${itemName} — ${status}${nilaiText} oleh ${formatTeacherName(teacher_name, teacher_jenis_kelamin)}`
          });
        }
      } catch (e) { console.error('notif error:', e); }
    }

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');
    const limit = searchParams.get('limit') || '20';
    const groupStudentIds = searchParams.get('group_student_ids');
    const date = searchParams.get('date');
    const chart = searchParams.get('chart'); // true/false
    const chartType = searchParams.get('type') || 'SALAT_FARDU';

    if (chart === 'true' && studentId) {
        const result = await query(
            `SELECT
                TO_CHAR(date::DATE, 'YYYY-MM') as month,
                TO_CHAR(date::DATE, 'Mon') as month_label,
                COUNT(DISTINCT date::DATE) * 5 as total_sessions,
                COUNT(*) as total_present
             FROM worship_records
             WHERE student_id = $1 AND type = $2
             AND date::DATE >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
             GROUP BY TO_CHAR(date::DATE, 'YYYY-MM'), TO_CHAR(date::DATE, 'Mon')
             ORDER BY month ASC`,
            [studentId, chartType]
        );
        return NextResponse.json({ success: result.success, data: result.data ?? [] });
    }

    let sql = `
      SELECT wr.*, wr.id_worship_records AS id,
             u.name as teacher_name,
             u.jenis_kelamin as teacher_jenis_kelamin,
             mdp.title as daily_prayer_title,
             mpr.title as prayer_reading_title
      FROM worship_records wr
      LEFT JOIN users u ON wr.teacher_id = u.id_users
      LEFT JOIN master_daily_prayers mdp ON wr.daily_prayer_id = mdp.id_master_daily_prayers
      LEFT JOIN master_prayer_readings mpr ON wr.prayer_reading_id = mpr.id_master_prayer_readings
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
  
    if (studentId) {
      sql += ` AND wr.student_id = $${params.length + 1}`;
      params.push(studentId);
    }

    if (groupStudentIds) {
      const ids = groupStudentIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (ids.length > 0) {
        const placeholders = ids.map((_, i) => `$${params.length + i + 1}`).join(', ');
        sql += ` AND wr.student_id IN (${placeholders})`;
        params.push(...ids);
      }
    }

    if (date) {
      sql += ` AND wr.date::date = $${params.length + 1}::date`;
      params.push(date);
    }
  
    sql += ` ORDER BY wr.date DESC, wr.created_at DESC LIMIT ${groupStudentIds ? 999 : limit}`;
  
    try {
      const result = await query(sql, params);
      const data = applyTeacherNameFormatting((result.data ?? []).map((r: any) => ({
        ...r,
        date: r.date ? (typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toLocaleDateString('en-CA')) : null
      })));
      return NextResponse.json({ success: result.success, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, quality, is_completed, daily_prayer_id, prayer_reading_id, prayer_name, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    let qualityNum: number | null = null;
    if (quality !== undefined && quality !== null) {
        qualityNum = Number(quality);
        if (!Number.isInteger(qualityNum) || qualityNum < 1 || qualityNum > 10) {
            return NextResponse.json({ success: false, error: 'Nilai harus berupa angka 1-10' }, { status: 400 });
        }
    }

    const result = await execute(
      `UPDATE worship_records
       SET quality = $1,
           is_completed = $2,
           daily_prayer_id = $3,
           prayer_reading_id = $4,
           prayer_name = $5,
           notes = $6
       WHERE id_worship_records = $7`,
      [qualityNum, is_completed ?? false, daily_prayer_id ?? null, prayer_reading_id ?? null, prayer_name ?? null, notes ?? null, id]
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }
    const result = await execute('DELETE FROM worship_records WHERE id_worship_records = $1', [id]);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
