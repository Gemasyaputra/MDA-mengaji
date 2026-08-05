import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const groupId = searchParams.get('group_id');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { success: false, error: 'start_date dan end_date wajib diisi' },
      { status: 400 },
    );
  }

  try {
    const params: (string | number)[] = [startDate, endDate];
    let idx = 3;
    let groupFilter = '';

    if (groupId) {
      groupFilter = ` AND s.group_id = $${idx}`;
      params.push(groupId);
      idx++;
    }

    const sql = `
      SELECT
        s.id AS student_id,
        s.name AS student_name,
        g.name AS group_name,
        COALESCE(att.hadir, 0) AS hadir,
        COALESCE(att.sakit, 0) AS sakit,
        COALESCE(att.izin, 0) AS izin,
        COALESCE(att.alfa, 0) AS alfa,
        COALESCE(att.total_pertemuan, 0) AS total_pertemuan,
        CASE
          WHEN COALESCE(att.total_pertemuan, 0) = 0 THEN 0
          ELSE ROUND(COALESCE(att.hadir, 0)::numeric / att.total_pertemuan * 100)
        END AS persentase_hadir,
        COALESCE(lr.jumlah_tilawah, 0) AS jumlah_tilawah,
        COALESCE(mr.jumlah_hafalan, 0) AS jumlah_hafalan,
        COALESCE(wr.jumlah_doa, 0) AS jumlah_doa,
        COALESCE(wr.jumlah_sholat, 0) AS jumlah_sholat
      FROM students s
      LEFT JOIN study_groups g ON s.group_id = g.id
      LEFT JOIN (
        SELECT
          student_id,
          COUNT(*) FILTER (WHERE status = 'HADIR') AS hadir,
          COUNT(*) FILTER (WHERE status = 'SAKIT') AS sakit,
          COUNT(*) FILTER (WHERE status = 'IZIN') AS izin,
          COUNT(*) FILTER (WHERE status = 'ALFA') AS alfa,
          COUNT(*) AS total_pertemuan
        FROM attendance
        WHERE date::date BETWEEN $1::date AND $2::date
        GROUP BY student_id
      ) att ON att.student_id = s.id
      LEFT JOIN (
        SELECT student_id, COUNT(*) AS jumlah_tilawah
        FROM learning_records
        WHERE date::date BETWEEN $1::date AND $2::date
        GROUP BY student_id
      ) lr ON lr.student_id = s.id
      LEFT JOIN (
        SELECT student_id, COUNT(*) AS jumlah_hafalan
        FROM memorization_records
        WHERE date::date BETWEEN $1::date AND $2::date
        GROUP BY student_id
      ) mr ON mr.student_id = s.id
      LEFT JOIN (
        SELECT
          student_id,
          COUNT(*) FILTER (WHERE type = 'DOA_HARIAN') AS jumlah_doa,
          COUNT(*) FILTER (WHERE type = 'BACAAN_SHOLAT') AS jumlah_sholat
        FROM worship_records
        WHERE date::date BETWEEN $1::date AND $2::date
        GROUP BY student_id
      ) wr ON wr.student_id = s.id
      WHERE 1=1${groupFilter}
      ORDER BY g.name ASC NULLS LAST, s.name ASC
    `;

    const result = await query(sql, params);
    return NextResponse.json({ success: result.success, data: result.data ?? [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
