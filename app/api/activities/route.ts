import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, executeReturning } from '@/lib/api-helpers';
import { requireTeacherOrAdmin } from '@/lib/require-teacher-or-admin';
import { formatTeacherName } from '@/lib/teacherName';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const limit = parseInt(searchParams.get('limit') || '5');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  // Determine image limit: if fetching single post (id present), get all images. Else get 1.
  const imageLimit = '';

  // Join with users to get author name and agg images
  let sql = `
    SELECT ap.*, ap.id_activity_posts AS id, u.name as author_name,
    u.role as author_role, u.jenis_kelamin as author_jenis_kelamin,
    (
      SELECT COALESCE(json_agg(x.image_url), '[]'::json)
      FROM (
        SELECT image_url
        FROM activity_images ai
        WHERE ai.post_id = ap.id_activity_posts
        ORDER BY ai.id_activity_images ASC
        ${imageLimit}
      ) x
    ) as images
    FROM activity_posts ap
    LEFT JOIN users u ON ap.author_id = u.id_users
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (id) {
      sql += ` AND ap.id_activity_posts = $${params.length + 1}`;
      params.push(id);
  }



  sql += ` ORDER BY ap.created_at DESC`;

  // Apply pagination only if NOT fetching a single post by ID
  if (!id) {
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  try {
      const result = await query(sql, params);
      if (result.success && Array.isArray(result.data)) {
          result.data = result.data.map((row: any) => ({
              ...row,
              author_name: row.author_role === 'teacher'
                  ? formatTeacherName(row.author_name, row.author_jenis_kelamin)
                  : row.author_name,
          }));
      }
      return NextResponse.json(result);
  } catch (error: any) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
      const body = await req.json();
      const auth = await requireTeacherOrAdmin(req, body.token);
      if (!auth.ok) {
        return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
      }

      const { title, content, activity_date, images } = body;
      // author_id is always the authenticated caller, never trusted from the
      // client — otherwise anyone could forge a post as another user.
      const author_id = auth.userId;

      if (!title || !author_id) {
           return NextResponse.json({ success: false, error: 'Title and Author ID are required' }, { status: 400 });
      }

      // 1. Insert Post
      const postResult = await executeReturning(
        `INSERT INTO activity_posts (author_id, title, content, activity_date, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING id_activity_posts AS id`,
        [
            author_id,
            title,
            content, 
            activity_date ? new Date(activity_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        ]
      );

      if (!postResult.success || !postResult.data) {
          throw new Error(postResult.error || 'Failed to create post');
      }

      const postId = postResult.data.id;

      // 2. Insert Images if any
      if (images && Array.isArray(images) && images.length > 0) {
          for (const imgUrl of images) {
              await execute(
                  `INSERT INTO activity_images (post_id, image_url, created_at) VALUES ($1, $2, NOW())`,
                  [postId, imgUrl]
              );
          }
      }
    
      return NextResponse.json({ success: true, data: { ...postResult.data, images } }, { status: 201 });
  } catch (error: any) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireTeacherOrAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
  }

  try {
      const existing = await queryOne('SELECT author_id FROM activity_posts WHERE id_activity_posts = $1', [id]);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Kabar tidak ditemukan' }, { status: 404 });
      }
      if (auth.role !== 'admin' && Number(existing.author_id) !== auth.userId) {
        return NextResponse.json({ success: false, error: 'Anda tidak berhak menghapus kabar ini' }, { status: 403 });
      }

      const result = await execute('DELETE FROM activity_posts WHERE id_activity_posts = $1', [id]);
      return NextResponse.json(result);
  } catch (error: any) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
      const body = await req.json();
      const auth = await requireTeacherOrAdmin(req, body.token);
      if (!auth.ok) {
        return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
      }

      const { id, title, content, images } = body;

      if (!id || !title) {
           return NextResponse.json({ success: false, error: 'ID and Title are required' }, { status: 400 });
      }

      const existing = await queryOne('SELECT author_id FROM activity_posts WHERE id_activity_posts = $1', [id]);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Kabar tidak ditemukan' }, { status: 404 });
      }
      if (auth.role !== 'admin' && Number(existing.author_id) !== auth.userId) {
        return NextResponse.json({ success: false, error: 'Anda tidak berhak mengubah kabar ini' }, { status: 403 });
      }

      // 1. Update Post
      const postResult = await executeReturning(
        `UPDATE activity_posts
         SET title = $1, content = $2
         WHERE id_activity_posts = $3 RETURNING *, id_activity_posts AS id`,
        [title, content, id]
      );

      if (!postResult.success || !postResult.data) {
          throw new Error(postResult.error || 'Failed to update post');
      }

      // 2. Update Images (Delete old, Insert new)
      // First, delete existing images
      await execute('DELETE FROM activity_images WHERE post_id = $1', [id]);

      // Then insert new ones
      if (images && Array.isArray(images) && images.length > 0) {
          for (const imgUrl of images) {
              await execute(
                  `INSERT INTO activity_images (post_id, image_url, created_at) VALUES ($1, $2, NOW())`,
                  [id, imgUrl]
              );
          }
      }
    
      return NextResponse.json({ success: true, data: { ...postResult.data, images } });
  } catch (error: any) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
