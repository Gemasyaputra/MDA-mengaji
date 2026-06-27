import { getServerSession } from "next-auth/next";
import RedirectClient from "./RedirectClient";

export default async function MobileAuthSuccess({ searchParams }: { searchParams: { returnUrl?: string } }) {
  const session = await getServerSession();

  const baseUrl = searchParams?.returnUrl || 'mdamengaji://login';

  if (!session || !session.user) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Login Gagal</h2>
        <p>Silakan coba lagi.</p>
        <a href={`${baseUrl}?error=failed`}>Kembali ke Aplikasi</a>
      </div>
    );
  }

  const email = session.user.email;
  
  // Fetch role directly from database to avoid JWT caching issues
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/schema");
  const { eq } = await import("drizzle-orm");
  
  const dbUsers = await db.select().from(users).where(eq(users.email, email!)).limit(1);
  const role = dbUsers.length > 0 ? dbUsers[0].role : null;
  const userId = dbUsers.length > 0 ? dbUsers[0].id : null;

  if (role !== 'teacher' && role !== 'admin') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Akses Ditolak</h2>
        <p>Akun ini bukan akun Guru.</p>
        <p style={{ color: 'red', fontSize: 12 }}>
          Debug: Email = <b>{email}</b>, Role = <b>{role || 'KOSONG'}</b>
        </p>
        <a href={`${baseUrl}?error=not_teacher`}>Kembali ke Aplikasi</a>
      </div>
    );
  }

  const token = Buffer.from(JSON.stringify({ userId, email, role })).toString('base64');
  const redirectUrl = `${baseUrl}?token=${token}`;

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Login Berhasil!</h2>
      <p>Membuka kembali aplikasi...</p>
      
      {/* Client component handles the actual redirect */}
      <RedirectClient url={redirectUrl} />

      {/* Meta refresh as fallback */}
      <meta httpEquiv="refresh" content={`1;url=${redirectUrl}`} />

      <br/>
      <a href={redirectUrl} style={{ padding: '10px 20px', background: '#059669', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
        Kembali ke Aplikasi Sekarang
      </a>
    </div>
  );
}
