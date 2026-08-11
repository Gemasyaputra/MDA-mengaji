import { NextRequest, NextResponse } from 'next/server';
import { query, executeReturning } from '@/lib/api-helpers';

export async function GET() {
  const result = await query(
    'SELECT * FROM pengumuman ORDER BY created_at DESC'
  );
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { judul, isi, tanggal } = body;

  if (!judul) {
    return NextResponse.json(
      { success: false, error: 'judul wajib diisi' },
      { status: 400 }
    );
  }

  const result = await executeReturning(
    `INSERT INTO pengumuman (judul, isi, tanggal)
     VALUES ($1, $2, $3) RETURNING *`,
    [judul, isi, tanggal]
  );

  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
}