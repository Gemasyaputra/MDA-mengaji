import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireTeacherOrAdmin } from '@/lib/require-teacher-or-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTeacherOrAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE students
       SET reading_level = 'IQRO', iqro_graduated_at = NULL, current_level = NULL
       WHERE id_students = $1
       RETURNING *, id_students AS id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Santri tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('[DOWNGRADE SANTRI ERROR]', error.message);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
