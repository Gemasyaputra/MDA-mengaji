import { NextRequest, NextResponse } from 'next/server';
import { query, executeReturning, execute } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const result = await query('SELECT *, id_master_prayer_readings AS id FROM master_prayer_readings ORDER BY step_order ASC, title ASC');
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, arabic_text, translation, step_order, pdf_url, external_link } = body;

    if (!title) {
        return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const result = await executeReturning(
        `INSERT INTO master_prayer_readings (title, category, arabic_text, translation, step_order, pdf_url, external_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *, id_master_prayer_readings AS id`,
        [title, category || null, arabic_text || null, translation || null, step_order || 0, pdf_url || null, external_link || null]
    );

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, category, arabic_text, translation, step_order, pdf_url, external_link } = body;

    if (!id || !title) {
        return NextResponse.json({ success: false, error: "ID and Title are required" }, { status: 400 });
    }

    const result = await executeReturning(
        `UPDATE master_prayer_readings SET title = $1, category = $2, arabic_text = $3, translation = $4, step_order = $5, pdf_url = $6, external_link = $7 WHERE id_master_prayer_readings = $8 RETURNING *, id_master_prayer_readings AS id`,
        [title, category || null, arabic_text || null, translation || null, step_order || 0, pdf_url || null, external_link || null, id]
    );

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const result = await execute('DELETE FROM master_prayer_readings WHERE id_master_prayer_readings = $1', [id]);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
