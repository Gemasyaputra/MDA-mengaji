# SimMengaji - Sistem Pemantauan Akademik & Hafalan Santri

Aplikasi web *single-tenant* yang dikhususkan untuk operasional **MDA Masjid Nurul Huda**. Mendigitalisasi pencatatan presensi, setoran tilawah (Iqro/Al-Qur'an), setoran hafalan doa harian dan bacaan sholat, kabar kegiatan, serta portal pemantauan untuk orang tua.

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (Raw SQL parameterized + Drizzle ORM untuk migrasi/auth)
- **Database**: Neon PostgreSQL
- **Authentication**: NextAuth.js (Google OAuth)
- **File Storage**: Vercel Blob
- **PDF Export**: html2canvas (client-side)
- **Charts**: Recharts

## 👥 Aktor Sistem

Sistem mengenali 3 peran utama:

1. **Admin DKM** (`admin`) — login Google, mengelola seluruh data MDA
2. **Guru / Pengajar** (`teacher`) — login Google, hanya mengakses kelompok belajarnya
3. **Orang Tua** (`parent`) — akses publik via tautan (tanpa login) untuk memantau anaknya

> Catatan: aplikasi bersifat *single-tenant*, hanya melayani satu lembaga (MDA Masjid Nurul Huda). Tidak ada fitur multi-masjid.

## 📋 Fitur Utama

### 1. Manajemen Santri
- Daftar santri dikelompokkan per kelompok belajar
- Profil lengkap (nama, wali, kontak, alamat, tanggal lahir, level)
- Level: Iqro (Jilid 1-6) atau Al-Qur'an (per surah/ayat)

### 2. Presensi Harian
- Input kehadiran per kelompok per tanggal
- Status: Hadir, Sakit, Izin, Alfa
- Riwayat dan statistik kehadiran

### 3. Setoran Tilawah (Iqro / Al-Qur'an)
- Input setoran bacaan dengan jilid/surah, halaman/ayat awal-akhir
- Penilaian kualitas (A/B/C/D) + catatan
- Auto-fill posisi terakhir dari sesi sebelumnya
- Validasi batas ayat sesuai master surah

### 4. Setoran Hafalan Doa & Bacaan Sholat
- Pilih dari master Doa Harian atau Bacaan Sholat
- Status lulus/belum + kualitas (A/B/C)

### 5. Kabar / Activity Feed
- Posting kabar dengan judul, konten, gambar
- Komentar publik (orang tua tanpa login)
- Bagikan ke WhatsApp via tautan publik

### 6. Portal Orang Tua
- Akses lewat tautan unik berisi `student_id`
- Grafik kehadiran, progres tilawah, hafalan doa
- Cetak laporan PDF per santri

### 7. Manajemen Internal
- Kelola data guru (Admin DKM)
- Kelola kelompok belajar
- Bank materi (master surah, doa harian, bacaan sholat)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Neon PostgreSQL Database
- Google OAuth credentials (untuk login Admin/Guru)

### Environment Variables

Buat `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host/database
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Installation & Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd MDA-mengaji
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup Database**
```bash
node scripts/migrate.js
```

4. **Run Development Server**
```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── page.tsx              # Main app entry (client routing)
├── layout.tsx            # Root layout
├── api/                  # API routes
│   ├── auth/[...nextauth]/   # NextAuth (Google)
│   ├── students/
│   ├── attendance/
│   ├── learning-records/
│   ├── worship-records/
│   ├── activities/
│   ├── study-groups/
│   ├── teachers/
│   ├── master/               # Master data (surah, doa)
│   ├── dashboard/
│   ├── notifications/
│   └── upload/
├── laporan/[studentId]/  # Halaman laporan PDF publik
└── public/kabar/         # Halaman kabar publik

components/
├── Header.tsx
├── BottomNav.tsx
├── Sidebar.tsx
└── pages/
    ├── LoginPage.tsx
    ├── LandingPage.tsx
    ├── DashboardPage.tsx
    ├── SantriManagePage.tsx
    ├── SantriDetailPage.tsx
    ├── SantriHistoryPage.tsx
    ├── InputIqroPage.tsx
    ├── InputHafalnDoa.tsx
    ├── PresensiPage.tsx
    ├── PresensiDetailPage.tsx
    ├── KabarPage.tsx
    ├── KabarDetailPage.tsx
    ├── ParentViewPage.tsx
    ├── StudyGroupManagePage.tsx
    ├── ManageTeachersPage.tsx
    ├── MasterHafalanPage.tsx
    └── ActivityLogPage.tsx

lib/
├── db.ts               # Drizzle DB connection
├── schema.ts           # Drizzle schema (single-tenant)
└── api-helpers.ts      # Raw SQL helpers

scripts/
├── migrate.js          # Run migrations
├── migrate.sql         # SQL schema
└── seed.js             # Seed master data
```

## 🔐 Authentication

- **Admin DKM & Guru**: Google OAuth (NextAuth). Email harus terdaftar di tabel `users` dan `is_verified = true`.
- **Orang Tua**: tidak perlu akun. Akses via tautan `?student_id=...` yang dibagikan via WhatsApp.

## 📊 API Routes

### Students
- `GET /api/students` — Daftar santri (filter: `id`, `group_id`, `teacher_id`, `search`)
- `POST /api/students` — Tambah santri
- `PUT /api/students` — Update santri
- `DELETE /api/students?id=ID` — Hapus santri

### Attendance
- `GET /api/attendance` — Daftar/riwayat presensi
- `POST /api/attendance` — Bulk simpan presensi (upsert per student/tanggal)

### Learning & Worship Records
- `GET|POST /api/learning-records` — Setoran tilawah (Iqro/Al-Qur'an)
- `GET|POST /api/worship-records` — Setoran doa harian / bacaan sholat

### Activities
- `GET /api/activities` — Daftar kabar
- `POST /api/activities` — Buat kabar
- `PUT /api/activities` — Edit kabar
- `DELETE /api/activities?id=ID` — Hapus kabar

### Master Data
- `GET /api/master-data?type=surahs` — Daftar surah Al-Qur'an
- `GET /api/master/daily-prayers` — Doa harian
- `GET /api/master/prayer-readings` — Bacaan sholat

### Lainnya
- `GET /api/dashboard/stats` — Statistik dashboard
- `GET /api/dashboard/activity` — Feed aktivitas terkonsolidasi
- `GET|POST|PATCH /api/notifications` — Notifikasi
- `POST /api/upload` — Upload ke Vercel Blob

## 🛠️ Development

### Build untuk Production
```bash
pnpm build
pnpm start
```

## 📝 Database Schema

Tabel utama (lihat `lib/schema.ts` & `scripts/migrate.sql`):

**Master:**
- `master_surahs` — Daftar surah Al-Qur'an + jumlah ayat
- `master_daily_prayers` — Doa harian
- `master_prayer_readings` — Bacaan sholat

**Core:**
- `users` — Admin DKM & Guru (role: `admin` | `teacher`)
- `study_groups` — Kelompok belajar (kelas)
- `students` — Data santri + slug untuk URL portal ortu
- `attendance` — Presensi harian

**Transaksi:**
- `learning_records` — Setoran tilawah (Iqro/QURAN)
- `memorization_records` — Tahfidz (ZIYADAH/MURAJAAH)
- `worship_records` — Setoran doa harian / bacaan sholat
- `activity_posts` & `activity_images` & `activity_comments` — Kabar

## 🚀 Deployment ke Vercel

1. Push ke GitHub
2. Import project di Vercel
3. Set environment variables di Vercel dashboard
4. Deploy

## 📄 License

MIT License
