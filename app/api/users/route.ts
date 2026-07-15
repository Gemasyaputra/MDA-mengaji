import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, executeReturning, execute } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/require-admin';

// GET: List Users
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role'); // e.g., 'admin'

  try {
    let sql: string;
    const params: any[] = [];

    sql = 'SELECT id, name, email, phone, role, created_at FROM users WHERE 1=1';
    if (role) {
      sql += ' AND role = $1';
      params.push(role);
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create New User (Admin DKM)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { name, email, password, role = 'admin' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await executeReturning(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, passwordHash, role]
    );

    if (!result.success) {
      // Check for duplicate email
      if (result.error?.includes('unique constraint') || result.error?.includes('duplicate key')) {
          return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update User (Reset Password or Edit Profile)
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, name, email, password } = body;

    if (!id) {
       return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    let sql = 'UPDATE users SET ';
    const params: any[] = [];
    const updates: string[] = [];
    let idx = 1;

    if (name) {
        updates.push(`name = $${idx++}`);
        params.push(name);
    }
    if (email) {
        updates.push(`email = $${idx++}`);
        params.push(email);
    }
    if (password) {
        updates.push(`password_hash = $${idx++}`);
        params.push(await bcrypt.hash(password, 10));
    }

    if (updates.length === 0) {
        return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    sql += updates.join(', ') + ` WHERE id = $${idx} RETURNING id, name, email`;
    params.push(id);

    const result = await executeReturning(sql, params);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove User
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const caller_id = searchParams.get('caller_id'); // Optional: pass caller ID to prevent self-deletion

  if (!id) {
    return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
  }

  // Self-deletion check (additional layer in the API)
  if (caller_id && id === caller_id) {
    return NextResponse.json({ success: false, error: "Anda tidak dapat menghapus akun Anda sendiri." }, { status: 400 });
  }

  try {
    const result = await execute('DELETE FROM users WHERE id = $1', [id]);
    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
