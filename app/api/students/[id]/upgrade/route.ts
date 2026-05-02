import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE students 
       SET reading_level = 'ALQURAN', iqro_graduated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Santri tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('[UPGRADE SANTRI ERROR]', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
