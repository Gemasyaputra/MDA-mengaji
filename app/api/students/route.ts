import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, executeReturning } from '@/lib/api-helpers';

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const groupId = searchParams.get('group_id');
  const search = searchParams.get('search');
  const teacherId = searchParams.get('teacher_id');

  const behindActivitySubquery = `
    LEFT JOIN LATERAL (
      SELECT GREATEST(
        COALESCE((SELECT MAX(date) FROM learning_records WHERE student_id = s.id), '1900-01-01'),
        COALESCE((SELECT MAX(date) FROM memorization_records WHERE student_id = s.id), '1900-01-01')
      ) as last_activity_date
    ) la ON true
  `;

  if (id) {
    const result = await queryOne(
      `SELECT s.*, g.name as group_name, la.last_activity_date,
              (la.last_activity_date < CURRENT_DATE - INTERVAL '14 days') as is_behind
       FROM students s
       LEFT JOIN study_groups g ON s.group_id = g.id
       ${behindActivitySubquery}
       WHERE s.id = $1`,
      [id]
    );
    return NextResponse.json({ success: !!result, data: result });
  }

  let sql = `
    SELECT s.*, g.name as group_name, la.last_activity_date,
           (la.last_activity_date < CURRENT_DATE - INTERVAL '14 days') as is_behind
    FROM students s
    LEFT JOIN study_groups g ON s.group_id = g.id
    ${behindActivitySubquery}
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  let idx = 1;


  if (groupId) {
    sql += ` AND s.group_id = $${idx}`;
    params.push(groupId);
    idx++;
  }
  if (teacherId) {
    sql += ` AND g.teacher_id = $${idx}`;
    params.push(teacherId);
    idx++;
  }
  if (search) {
      sql += ` AND LOWER(s.name) LIKE $${idx}`;
      params.push(`%${search.toLowerCase()}%`);
      idx++;
  }

  sql += ' ORDER BY s.created_at DESC';

  const result = await query(sql, params);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {

    group_id,
    name,
    slug,
    parent_name,
    parent_phone,
    birth_date,
    gender,
    address,
    current_level,
    photo_url,
  } = body;

  if (!name) {
    return NextResponse.json(
      { success: false, error: 'name wajib diisi' },
      { status: 400 }
    );
  }

  const finalSlug = slug && slug.trim() ? slug.trim() : slugify(name);
  const validGender = gender === 'L' || gender === 'P' ? gender : null;

  const result = await executeReturning(
    `INSERT INTO students (group_id, name, slug, parent_name, parent_phone, birth_date, gender, address, current_level, photo_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      group_id || null,
      name,
      finalSlug,
      parent_name || null,
      parent_phone || null,
      birth_date || null,
      validGender,
      address || null,
      current_level || null,
      photo_url || null,
    ]
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const {
    id,

    group_id,
    name,
    slug,
    parent_name,
    parent_phone,
    birth_date,
    gender,
    address,
    current_level,
    photo_url,
    teacher_note,
  } = body;

  if (!id || !name) {
    return NextResponse.json(
      { success: false, error: 'id dan name wajib diisi' },
      { status: 400 }
    );
  }

  const validGender = gender === 'L' || gender === 'P' ? gender : null;

  const result = await executeReturning(
    `UPDATE students SET
      group_id = $1, name = $2, slug = COALESCE($3, slug),
      parent_name = $4, parent_phone = $5, birth_date = $6, gender = $7,
      address = $8, current_level = $9, photo_url = $10, teacher_note = $11
     WHERE id = $12
     RETURNING *`,
    [
      group_id || null,
      name,
      slug || null,
      parent_name || null,
      parent_phone || null,
      birth_date || null,
      validGender,
      address || null,
      current_level || null,
      photo_url || null,
      teacher_note || null,
      id,
    ]
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  if (!result.data) {
    return NextResponse.json(
      { success: false, error: 'Santri tidak ditemukan' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID wajib diisi' },
      { status: 400 }
    );
  }

  const result = await execute('DELETE FROM students WHERE id = $1', [id]);
  return NextResponse.json(result);
}
