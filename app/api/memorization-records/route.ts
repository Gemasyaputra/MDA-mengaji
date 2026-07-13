import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const limit = searchParams.get('limit') || '20';

  let sql = `
    SELECT mr.*,
           u.name as teacher_name,
           ms.name_latin as surah_name
    FROM memorization_records mr
    LEFT JOIN users u ON mr.teacher_id = u.id
    LEFT JOIN master_surahs ms ON mr.surah_id = ms.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (studentId) {
    sql += ` AND mr.student_id = $${params.length + 1}`;
    params.push(studentId);
  }

  sql += ` ORDER BY mr.date DESC, mr.created_at DESC LIMIT ${limit}`;

  try {
    const result = await query(sql, params);
    const data = (result.data ?? []).map((r: any) => ({
      ...r,
      date: r.date ? (typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toLocaleDateString('en-CA')) : null
    }));
    return NextResponse.json({ success: result.success, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
