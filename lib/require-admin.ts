import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

type AdminCheckResult = { ok: true } | { ok: false; status: number; message: string };

export async function requireAdmin(): Promise<AdminCheckResult> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user) {
    return { ok: false, status: 401, message: "Anda harus login terlebih dahulu." };
  }
  if (role !== "admin") {
    return { ok: false, status: 403, message: "Hanya admin yang dapat melakukan aksi ini." };
  }
  return { ok: true };
}
