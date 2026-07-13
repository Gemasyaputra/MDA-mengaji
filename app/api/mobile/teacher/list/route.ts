import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const teachers = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.role, 'GURU'));

    return NextResponse.json({ success: true, data: teachers });
  } catch (err) {
    console.error('Error fetching teachers:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data guru' }, { status: 500 });
  }
}
