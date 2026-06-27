import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
// You might need to export authOptions from [...nextauth]/route.ts, but if not exported, we can just use getServerSession() without args in app router or we might need to recreate it. Let's see if we can just redirect to the homepage if fail.

export default async function MobileAuthSuccess() {
  const session = await getServerSession();

  if (!session || !session.user) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Login Gagal</h2>
        <p>Silakan coba lagi.</p>
        <a href="mdamengaji://login?error=failed">Kembali ke Aplikasi</a>
      </div>
    );
  }

  const email = session.user.email;
  
  // Fetch role directly from database to avoid JWT caching issues
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/schema");
  const { eq } = await import("drizzle-orm");
  
  const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const role = dbUsers.length > 0 ? dbUsers[0].role : null;
  const userId = dbUsers.length > 0 ? dbUsers[0].id : null;

  if (role !== 'teacher' && role !== 'admin') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Akses Ditolak</h2>
        <p>Akun ini bukan akun Guru.</p>
        <p style={{ color: 'red', fontSize: 12 }}>
          Debug: Email kamu adalah <b>{email}</b> dan jabatanmu terdeteksi sebagai <b>{role || 'KOSONG (undefined)'}</b>.
          <br/>
          Jika role KOSONG, coba <a href="https://mda-mengaji.vercel.app/api/auth/signout" target="_blank">Logout Disini</a> lalu login lagi.
        </p>
        <a href="mdamengaji://login?error=not_teacher">Kembali ke Aplikasi</a>
      </div>
    );
  }

  const token = Buffer.from(JSON.stringify({ userId, email, role })).toString('base64');

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Login Berhasil!</h2>
      <p>Membuka kembali aplikasi...</p>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              window.location.href = "mdamengaji://login?token=${token}";
            }, 1000);
          `
        }}
      />
      <br/>
      <a href={`mdamengaji://login?token=${token}`} style={{ padding: '10px 20px', background: '#059669', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
        Kembali ke Aplikasi Sekarang
      </a>
    </div>
  );
}
