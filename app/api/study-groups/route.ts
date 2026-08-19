import { NextRequest, NextResponse } from 'next/server';
import { query, executeReturning, execute } from '@/lib/api-helpers';
import { applyTeacherNameFormatting } from '@/lib/teacherName';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacher_id, substitute_teacher_id, name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 },
      );
    }

    const result = await executeReturning(
      `INSERT INTO study_groups (teacher_id, substitute_teacher_id, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *, id_study_groups AS id`,
      [teacher_id || null, substitute_teacher_id || null, name, description || null],
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server.' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const teacherId = searchParams.get('teacher_id');

  let sql = `
    SELECT sg.id_study_groups AS id, sg.teacher_id, sg.substitute_teacher_id, sg.name, sg.description,
           u.name as teacher_name, u.jenis_kelamin as teacher_jenis_kelamin,
           su.name as substitute_teacher_name, su.jenis_kelamin as substitute_teacher_jenis_kelamin
    FROM study_groups sg
    LEFT JOIN users u ON sg.teacher_id = u.id_users
    LEFT JOIN users su ON sg.substitute_teacher_id = su.id_users
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  let idx = 1;


  if (teacherId) {
    // Guru pengganti (substitute_teacher_id) diberi akses yang sama seperti
    // wali kelas tetap ke kelas ini, jadi ikut dimasukkan di sini.
    sql += ` AND (sg.teacher_id = $${idx} OR sg.substitute_teacher_id = $${idx})`;
    params.push(teacherId);
    idx++;
  }

  sql += ' ORDER BY sg.name ASC';

  const result = await query(sql, params);
  if (result.data) {
    applyTeacherNameFormatting(result.data);
    applyTeacherNameFormatting(result.data, 'substitute_teacher_name', 'substitute_teacher_jenis_kelamin');
  }
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, teacher_id, substitute_teacher_id, name, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'ID and Name are required' },
        { status: 400 },
      );
    }

    const result = await executeReturning(
      `UPDATE study_groups
       SET teacher_id = $1, substitute_teacher_id = $2, name = $3, description = $4
       WHERE id_study_groups = $5
       RETURNING *, id_study_groups AS id`,
      [teacher_id || null, substitute_teacher_id || null, name, description || null, id],
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, error: 'Study group not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server.' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID is required' },
      { status: 400 },
    );
  }

  const result = await execute('DELETE FROM study_groups WHERE id_study_groups = $1', [id]);
  return NextResponse.json(result);
}
