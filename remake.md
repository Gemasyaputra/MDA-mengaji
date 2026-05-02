Berikut adalah isi draf yang sudah disesuaikan dengan rencana perombakan sistem TA kamu:

```markdown
# Rencana Perubahan Single-Tenant (Remake)

Aplikasi saat ini memiliki arsitektur **Multi-Tenant**, di mana terdapat entitas `mosques` dan setiap data (users, students, activities, dll) terikat dengan `mosque_id`.

Karena aplikasi akan diubah menjadi **Single-Tenant** (hanya untuk satu instansi/masjid/sekolah), silakan tuliskan dan jelaskan secara detail perubahan apa saja yang ingin kamu lakukan di file ini.

## 📝 Daftar Perubahan yang Diinginkan

1. **Menghapus Modul dan Role "Super Admin":** Menghilangkan akses dan halaman yang dikhususkan untuk pengelola platform SaaS. Sistem hanya akan berfokus pada hierarki internal satu institusi, yaitu menyisakan role Admin (pengelola MDA), Teacher (pengajar), dan Parent (orang tua).
2. **Memangkas Fitur Registrasi & Approval MDA:** Menghapus seluruh endpoint API dan antarmuka pendaftaran entitas institusi baru, karena sistem akan langsung di-*deploy* secara eksklusif untuk satu institusi.
3. **Menyederhanakan Skema Database:** Menghapus entitas/tabel khusus institusi dan membuang kolom relasi *tenant* (Tenant ID) di seluruh tabel terkait guna mengurangi kompleksitas kueri saat pengembangan dan mempermudah penjelasan ERD saat sidang TA.
4. **Membersihkan Logika Multi-Tenant di API dan Otentikasi:** Menghapus kewajiban mem-filter data berdasarkan institusi pada seluruh operasi CRUD di *backend*, serta menyederhanakan *payload session* login.

---

## 🏗️ Dampak Perubahan (Opsional/Draft)

- **Database Schema**: Hapus definisi tabel `mosques` di dalam `lib/schema.ts`[cite: 1]. Hapus kolom `mosque_id` beserta konstrain *foreign key*-nya di tabel `users`, `students`, `teachers`, `study_groups`, serta seluruh tabel transaksi presensi dan nilai.
- **Authentication**: Modifikasi konfigurasi di `app/api/auth/[...nextauth]/route.ts`[cite: 1] agar sistem tidak perlu lagi mengekstrak dan menyimpan `mosque_id` ke dalam *session*, serta tidak perlu mengecek `mosque.isApproved`. Evaluasi role pengguna dengan menghapus `SUPER_ADMIN`.
- **Dashboard / UI**: Hapus file antarmuka yang tidak relevan seperti `components/pages/SuperAdminDashboard.tsx` dan `components/pages/SuperAdminMosqueDetail.tsx`[cite: 1]. Hapus juga form pendaftaran institusi di halaman awal.
- **API Routes**: Hapus sepenuhnya direktori `app/api/register-mosque/` dan `app/api/mosques/` beserta turunannya seperti `/approve` dan `/detail`[cite: 1]. Pada modul API lain (seperti attendance, activities, dll), hapus semua klausa kueri `where(eq(..., mosqueId))` karena seluruh data di database sudah otomatis milik institusi tersebut.
- **Scripts Pendukung**: Hapus file pendukung yang ditujukan untuk *multi-tenant* seperti `seed-superadmin.js`[cite: 1].

---

## ✅ Implementasi yang Telah Selesai (Progress Report)

Perubahan arsitektur dari **Multi-Tenant ke Single-Tenant** secara menyeluruh telah dieksekusi di ranah *Database*, *Backend API*, maupun *Frontend UI*:

### 1. Modifikasi Database (Schema)
- Tabel `mosques` telah sepenuhnya dihapus dari database.
- Kolom `mosque_id` (beserta *foreign key*) telah dihapus secara massal dari tabel `users`, `students`, `study_groups`, dan `activity_posts`.
- Konstrain database untuk peran (`users_role_check`) telah diperbarui untuk hanya mengizinkan role internal institusi. 

### 2. Penyesuaian Role (Autentikasi & Otorisasi)
- Role **Super Admin** dan semua modul tampilannya (`SuperAdminDashboard`, `SuperAdminMosqueDetail`) dihapus total.
- Role **Parent** (Orang Tua) dihapus fungsionalitas *login*-nya. Konsep aplikasi disepakati menjadi: *"Orang tua tidak perlu membuat akun, progres belajar dan presensi akan dikirimkan via tautan (link)"*. Logika *redirect* ke `ParentViewPage` saat otentikasi telah dicabut.
- Saat ini sistem hanya memiliki dua role utama: **Admin** (Pengelola DKM/MDA) dan **Teacher** (Guru). 

### 3. Pembersihan Backend API
- Seluruh endpoint API (`/api/students`, `/api/study-groups`, `/api/teachers`, `/api/dashboard/stats`, `/api/attendance`, `/api/notifications`) telah dibersihkan dari parameter pengecekan `mosque_id`.
- Aplikasi tidak lagi bergantung pada URL Query Parameter atau otorisasi berbasis ID masjid untuk melakukan operasi *Create*, *Read*, *Update*, dan *Delete* (CRUD). Data otomatis mengasumsikan satu kepemilikan tunggal (MDA Masjid Nurul Huda).

### 4. Perbaikan UI / Frontend
- Form pendaftaran Institusi / Masjid telah dihapus.
- Segala *Dropdown Input* yang dulunya memaksa pengguna memilih asal instansi (misal di form input Guru, Santri, Kelompok Belajar) telah dihapus dari antarmuka.
- Dependensi `mosque_id` dari *React Query* (*caching*) telah dibersihkan di seluruh komponen pada folder `components/pages/`.
- Memperbaiki semua masalah tipe data TypeScript (seperti _property mosque_id does not exist_ atau _Object is possibly null_ pada variabel `currentUser`) yang timbul akibat pencabutan arsitektur SaaS lama.

### 5. Re-Branding Nama Institusi
- Nama *placeholder* generik sebelumnya seperti "MagribMengaji", "Lembaga Pendidikan", maupun label dinamis "Masjid" telah diubah 100% (Hardcoded) menjadi **MDA Masjid Nurul Huda**.
- Perubahan ini mencakup *Header*, *Dashboard*, *Landing Page*, *Login Page*, dan *Title Tag / Meta SEO* aplikasi.

---
**Status Aplikasi:** Stabil (Bebas dari *Typescript Errors* dan fungsi dasar berjalan normal untuk lingkup institusi tunggal).
```
