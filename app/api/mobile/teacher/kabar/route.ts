import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute, executeReturning } from "@/lib/api-helpers";
import { verifyTeacherToken } from "@/lib/mobile-auth";

function decodeTeacherId(token: string | undefined | null): number | null {
  const payload = verifyTeacherToken(token);
  return payload ? Number(payload.userId) : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, title, content, images } = body;

    const teacherId = decodeTeacherId(token);
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
    }
    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    const postResult = await executeReturning(
      `INSERT INTO activity_posts (author_id, title, content, activity_date, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
      [teacherId, title, content, new Date().toISOString().split("T")[0]]
    );

    if (!postResult.success || !postResult.data) {
      throw new Error(postResult.error || "Failed to create post");
    }

    const postId = postResult.data.id;

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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, id, title, content, images } = body;

    const teacherId = decodeTeacherId(token);
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
    }
    if (!id || !title || !content) {
      return NextResponse.json({ success: false, error: "ID, judul, dan konten wajib diisi" }, { status: 400 });
    }

    const existing = await queryOne(`SELECT author_id FROM activity_posts WHERE id = $1`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Kabar tidak ditemukan" }, { status: 404 });
    }
    if (Number(existing.author_id) !== teacherId) {
      return NextResponse.json({ success: false, error: "Anda tidak berhak mengubah kabar ini" }, { status: 403 });
    }

    const postResult = await executeReturning(
      `UPDATE activity_posts SET title = $1, content = $2 WHERE id = $3 RETURNING *`,
      [title, content, id]
    );

    if (!postResult.success || !postResult.data) {
      throw new Error(postResult.error || "Failed to update post");
    }

    await execute("DELETE FROM activity_images WHERE post_id = $1", [id]);
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const teacherId = decodeTeacherId(token);
  if (!teacherId) {
    return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ success: false, error: "ID wajib diisi" }, { status: 400 });
  }

  try {
    const existing = await queryOne(`SELECT author_id FROM activity_posts WHERE id = $1`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Kabar tidak ditemukan" }, { status: 404 });
    }
    if (Number(existing.author_id) !== teacherId) {
      return NextResponse.json({ success: false, error: "Anda tidak berhak menghapus kabar ini" }, { status: 403 });
    }

    const result = await execute("DELETE FROM activity_posts WHERE id = $1", [id]);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
