import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, execute } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  let sql = `
    SELECT u.id, u.name, u.email, u.phone, u.role
    FROM users u
    WHERE u.role = 'teacher'
  `;
  const params: (string | number)[] = [];

  sql += ' ORDER BY u.name ASC';

  try {
    const result = await query(sql, params);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const {
      name, email, phone, password,
      nik, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah,
      alamat, rt_rw, kel_desa, kecamatan, agama, status_perkawinan,
      pekerjaan, kewarganegaraan
    } = body;

    if (!name || !email) {
        return NextResponse.json({ success: false, error: 'Name and Email are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.success && Array.isArray(existing.data) && existing.data.length > 0) {
        return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }

    // Default password if not provided
    const passwordHash = await bcrypt.hash(password || 'teacher123', 10);

    const result = await execute(
        `INSERT INTO users (
           name, email, phone, role, password_hash, is_verified, created_at,
           nik, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah,
           alamat, rt_rw, kel_desa, kecamatan, agama, status_perkawinan,
           pekerjaan, kewarganegaraan
         )
         VALUES ($1, $2, $3, 'teacher', $4, true, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          name, email, phone || null, passwordHash,
          nik || null, tempat_lahir || null, tanggal_lahir || null, jenis_kelamin || null, golongan_darah || null,
          alamat || null, rt_rw || null, kel_desa || null, kecamatan || null, agama || null, status_perkawinan || null,
          pekerjaan || null, kewarganegaraan || null
        ]
    );

    return NextResponse.json(result, { status: result.success ? 201 : 400 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    try {
        const body = await req.json();
        const { 
          id, name, email, phone,
          nik, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah,
          alamat, rt_rw, kel_desa, kecamatan, agama, status_perkawinan,
          pekerjaan, kewarganegaraan 
        } = body;

        if (!id) {
             return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        const result = await execute(
            `UPDATE users SET 
              name = $1, email = $2, phone = $3,
              nik = $5, tempat_lahir = $6, tanggal_lahir = $7, jenis_kelamin = $8, golongan_darah = $9,
              alamat = $10, rt_rw = $11, kel_desa = $12, kecamatan = $13, agama = $14, status_perkawinan = $15,
              pekerjaan = $16, kewarganegaraan = $17
             WHERE id = $4 AND role = 'teacher'`,
            [
              name, email, phone, id,
              nik || null, tempat_lahir || null, tanggal_lahir || null, jenis_kelamin || null, golongan_darah || null,
              alamat || null, rt_rw || null, kel_desa || null, kecamatan || null, agama || null, status_perkawinan || null,
              pekerjaan || null, kewarganegaraan || null
            ]
        );

        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    try {
        const result = await execute("DELETE FROM users WHERE id = $1 AND role = 'teacher'", [id]);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
