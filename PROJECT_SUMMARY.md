# SimMengaji - Project Summary

## ✅ Ringkasan

Aplikasi web *single-tenant* yang dikhususkan untuk operasional **MDA Masjid Nurul Huda**. Mendigitalisasi pencatatan akademik (presensi, setoran tilawah, hafalan doa) dan menyediakan portal pemantauan untuk orang tua tanpa perlu login.

## 📦 Yang Dibangun

### 1. Database Setup
- ✅ Drizzle ORM schema (`lib/schema.ts`) — tanpa multi-tenant
- ✅ Database configuration (`lib/db.ts`)
- ✅ Migration script (`scripts/migrate.sql`, `scripts/migrate.js`)
- ✅ Seed master data (`scripts/seed.js`, `scripts/generate_surahs.js`)

### 2. API Routes
Mix Raw SQL parameterized + Drizzle ORM (untuk auth & migrasi):

- ✅ `/api/auth/[...nextauth]` — NextAuth Google OAuth
- ✅ `/api/students` — CRUD santri
- ✅ `/api/attendance` — CRUD presensi
- ✅ `/api/learning-records` — Setoran tilawah Iqro/Al-Qur'an
- ✅ `/api/worship-records` — Setoran doa harian / bacaan sholat
- ✅ `/api/activities` — Kabar/feed
- ✅ `/api/study-groups` — Kelompok belajar
- ✅ `/api/teachers` — Data guru
- ✅ `/api/users` — Manajemen user
- ✅ `/api/master/*` & `/api/master-data` — Master surah, doa, bacaan sholat
- ✅ `/api/dashboard/stats` & `/api/dashboard/activity` — Stats & feed
- ✅ `/api/notifications` — Notifikasi
- ✅ `/api/upload` — Upload ke Vercel Blob
- ✅ `/api/export-pdf` — Stub (PDF di-handle client-side)
- ✅ `/api/verify-email` — Verifikasi email

### 3. Frontend Pages

#### Shared Components
- ✅ `Header.tsx` — Header dengan role badge & notifikasi
- ✅ `BottomNav.tsx` — Navigation mobile (admin/teacher)
- ✅ `Sidebar.tsx` — Sidebar desktop (admin/teacher)
- ✅ `SearchableSelect.tsx`, `DeleteModal.tsx`, `Toast.tsx`

#### Authentication & Landing
- ✅ `LandingPage.tsx` — Halaman publik
- ✅ `LoginPage.tsx` — Login Google OAuth

#### Dashboard & Manajemen
- ✅ `DashboardPage.tsx` — Dashboard utama
- ✅ `SantriManagePage.tsx` — Daftar & kelola santri
- ✅ `SantriDetailPage.tsx` — Profil santri
- ✅ `SantriHistoryPage.tsx` — Riwayat aktivitas
- ✅ `StudyGroupManagePage.tsx` — Kelompok belajar
- ✅ `ManageTeachersPage.tsx` — Data guru (Admin DKM)
- ✅ `MasterHafalanPage.tsx` — Bank materi

#### Input Pembelajaran
- ✅ `InputIqroPage.tsx` — Setoran tilawah
- ✅ `InputHafalnDoa.tsx` — Setoran doa harian / bacaan sholat
- ✅ `PresensiPage.tsx` & `PresensiDetailPage.tsx` — Presensi

#### Kabar & Activity
- ✅ `KabarPage.tsx` & `KabarDetailPage.tsx` — Activity feed dengan komentar publik
- ✅ `ActivityLogPage.tsx` — Log aktivitas

#### Portal Orang Tua (Publik, Tanpa Login)
- ✅ `ParentViewPage.tsx` — Portal pemantauan
- ✅ `app/laporan/[studentId]/` — Laporan PDF cetak

### 4. Features
- ✅ Role-based navigation (admin, teacher, parent)
- ✅ Google OAuth via NextAuth
- ✅ Akses publik portal ortu via `student_id`
- ✅ Auto-fill setoran dari sesi sebelumnya
- ✅ Validasi batas ayat per surah
- ✅ Notifikasi sistem (polling 60s)
- ✅ Upload gambar (Vercel Blob) dengan kompresi WebP
- ✅ Bagikan kabar ke WhatsApp via tautan publik

## 🔧 Tech Stack

```
Frontend:
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
- @tanstack/react-query
- sonner (toast)
- Recharts

Backend:
- Next.js API Routes
- PostgreSQL (Neon)
- Drizzle ORM (auth & migrations)
- Raw SQL parameterized (transaksi)

Auth & Storage:
- NextAuth.js (Google OAuth)
- Vercel Blob

Tooling:
- pnpm
- Drizzle Kit
```

## 📁 Struktur File

```
app/
├── page.tsx              # Main entry (client routing)
├── layout.tsx
├── api/
│   ├── auth/[...nextauth]/
│   ├── students/, attendance/, learning-records/, worship-records/
│   ├── activities/, study-groups/, teachers/, users/
│   ├── master/, master-data/
│   ├── dashboard/, notifications/, upload/, export-pdf/, verify-email/
├── laporan/[studentId]/   # Halaman cetak PDF publik
└── public/kabar/          # Halaman kabar publik

components/
├── Header.tsx, BottomNav.tsx, Sidebar.tsx
├── SearchableSelect.tsx, DeleteModal.tsx, Toast.tsx
└── pages/
    ├── LandingPage.tsx, LoginPage.tsx, DashboardPage.tsx
    ├── SantriManagePage.tsx, SantriDetailPage.tsx, SantriHistoryPage.tsx
    ├── InputIqroPage.tsx, InputHafalnDoa.tsx
    ├── PresensiPage.tsx, PresensiDetailPage.tsx
    ├── KabarPage.tsx, KabarDetailPage.tsx, ActivityLogPage.tsx
    ├── ParentViewPage.tsx
    ├── StudyGroupManagePage.tsx, ManageTeachersPage.tsx
    └── MasterHafalanPage.tsx

lib/
├── db.ts (Drizzle DB pool)
├── schema.ts (Drizzle schema — single-tenant)
└── api-helpers.ts (Raw SQL helpers)

scripts/
├── migrate.js, migrate.sql
├── seed.js, generate_surahs.js
└── (helper scripts lain)
```

## 👥 Login & Akses

Aplikasi mengenali **3 peran**:

1. **Admin DKM** (`admin`)
   - Login Google OAuth
   - Akses: dashboard, santri, presensi, semua setoran, kelompok, guru, master, kabar

2. **Guru / Pengajar** (`teacher`)
   - Login Google OAuth
   - Akses: dashboard, santri di kelompoknya, presensi, setoran, master, kabar

3. **Orang Tua** (`parent`)
   - **Tidak perlu login**
   - Akses via tautan publik berisi `student_id` yang dibagikan via WhatsApp
   - Lihat progres, kehadiran, hafalan anak, cetak laporan PDF

## 📊 Database Schema

**Master Data:**
- `master_surahs` — Daftar surah Al-Qur'an
- `master_daily_prayers` — Doa harian
- `master_prayer_readings` — Bacaan sholat

**Core:**
- `users` — Admin & Guru (`role IN ('admin', 'teacher')`)
- `study_groups` — Kelompok belajar
- `students` — Santri (+ slug untuk portal ortu)
- `attendance` — Presensi harian

**Transaksi:**
- `learning_records` — Setoran tilawah (Iqro/QURAN)
- `memorization_records` — Tahfidz (Ziyadah/Murajaah)
- `worship_records` — Setoran doa & bacaan sholat
- `activity_posts`, `activity_images`, `activity_comments` — Kabar

## 🚀 Deployment

1. Set environment variables di Vercel:
   - `DATABASE_URL`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   - `BLOB_READ_WRITE_TOKEN`
2. Run migration: `node scripts/migrate.js`
3. Push ke GitHub → Vercel auto-deploy

## ✨ Catatan Implementasi

### Single-Tenant
Aplikasi sengaja dirancang **single-tenant** untuk MDA Masjid Nurul Huda saja. Tidak ada tabel `mosques`, kolom `mosque_id`, atau role *Super Admin*. Penyederhanaan ini sesuai dengan keputusan revisi proyek (lihat `remake.md`).

### Strategi Query
- **Drizzle ORM**: dipakai untuk auth (`app/api/auth/[...nextauth]`) dan migrasi schema
- **Raw SQL Parameterized**: dipakai untuk seluruh transaksi (presensi, setoran, kabar) untuk fleksibilitas query kompleks (UNION ALL, JOIN multi-tabel)

### Routing
- App Router untuk API & layout
- Custom client-side routing di `app/page.tsx` (state-based) untuk SPA-like UX dengan persistensi via `sessionStorage`

## 📊 Status

| Komponen | Status |
|----------|--------|
| Database | ✅ Schema single-tenant ready |
| API Routes | ✅ Lengkap |
| Frontend Pages | ✅ 17 halaman utama |
| Authentication | ✅ Google OAuth (NextAuth) |
| Portal Ortu | ✅ Akses publik tanpa login |
| File Upload | ✅ Vercel Blob |
| PDF Export | ✅ Client-side (html2canvas) |

---

**Aplikasi siap digunakan untuk operasional MDA Masjid Nurul Huda.**
