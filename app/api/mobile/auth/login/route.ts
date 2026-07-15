import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { signTeacherToken } from "@/lib/mobile-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email dan password wajib diisi!" }, { status: 400 });
    }

    // Cari user di database
    const userResult = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, "teacher")))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: "Akun tidak ditemukan atau Anda bukan Guru." }, { status: 401 });
    }

    const user = userResult[0];

    const passwordMatches = await bcrypt.compare(password, user.passwordHash || '');
    if (!passwordMatches) {
      return NextResponse.json({ success: false, message: "Password salah!" }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ success: false, message: "Akun belum diverifikasi oleh Admin." }, { status: 403 });
    }

    // Buat token guru (JWT, berlaku 30 hari)
    const token = signTeacherToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      }
    });

  } catch (error) {
    console.error("Login Mobile API Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server." }, { status: 500 });
  }
}
