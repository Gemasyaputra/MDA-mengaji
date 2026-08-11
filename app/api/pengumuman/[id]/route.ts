import { NextRequest, NextResponse } from 'next/server';
import { queryOne, executeReturning, execute } from '@/lib/api-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await queryOne('SELECT * FROM pengumuman WHERE id = $1', [id]);
  if (!data) return NextResponse.json({ success: false, error: 'Tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { judul, isi, tanggal } = body;

  const result = await executeReturning(
    `UPDATE pengumuman SET judul = $1, isi = $2, tanggal = $3
     WHERE id = $4 RETURNING *`,
    [judul, isi, tanggal, id]
  );
  return NextResponse.json({ success: true, data: result.data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await execute('DELETE FROM pengumuman WHERE id = $1', [id]);
  return NextResponse.json(result);
}