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
    SELECT u.id_users AS id, u.name, u.email, u.phone, u.role, u.photo_url, u.jenis_kelamin, u.alamat
    FROM users u
    WHERE u.role = 'teacher'
  `;
  const params: (string | number)[] = [];

  sql += ' ORDER BY u.name ASC';

  try {
    const result = await query(sql, params);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { name, email, phone, password, jenis_kelamin, alamat, photo_url } = body;

    if (!name || !email) {
        return NextResponse.json({ success: false, error: 'Name and Email are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await query('SELECT id_users AS id FROM users WHERE email = $1', [email]);
    if (existing.success && Array.isArray(existing.data) && existing.data.length > 0) {
        return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }

    // Default password if not provided
    const passwordHash = await bcrypt.hash(password || 'teacher123', 10);

    const result = await execute(
        `INSERT INTO users (
           name, email, phone, role, password_hash, is_verified, created_at,
           jenis_kelamin, alamat, photo_url
         )
         VALUES ($1, $2, $3, 'teacher', $4, true, NOW(), $5, $6, $7)`,
        [name, email, phone || null, passwordHash, jenis_kelamin || null, alamat || null, photo_url || null]
    );

    return NextResponse.json(result, { status: result.success ? 201 : 400 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    try {
        const body = await req.json();
        const { id, name, email, phone, jenis_kelamin, alamat, photo_url } = body;

        if (!id) {
             return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        const result = await execute(
            `UPDATE users SET
              name = $1, email = $2, phone = $3,
              jenis_kelamin = $5, alamat = $6, photo_url = $7
             WHERE id_users = $4 AND role = 'teacher'`,
            [name, email, phone, id, jenis_kelamin || null, alamat || null, photo_url || null]
        );

        return NextResponse.json(result);

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
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
        const result = await execute("DELETE FROM users WHERE id_users = $1 AND role = 'teacher'", [id]);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
    }
}
