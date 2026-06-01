# Analisis Fitur Codebase MDA Mengaji

Berdasarkan analisis menyeluruh terhadap seluruh kode sumber di dalam proyek ini setelah proses penyederhanaan (single-tenant), berikut adalah temuan mengenai fitur-fitur yang masih ada maupun yang sudah tidak terpakai:

## 1. Fitur Scan KTP (AI OCR)
**Status: MASIH ADA & AKTIF DIGUNAKAN**
Berbeda dengan dugaan bahwa fitur ini mungkin tidak terpakai, fitur Scan KTP justru masih terintegrasi dengan baik ke dalam aplikasi saat ini.
- **Frontend:** Pada file `components/pages/ManageTeachersPage.tsx`, terdapat antarmuka yang sangat jelas untuk fitur "Pindai KTP (Otomatis Diisi AI)". Fitur ini memiliki animasi _loading scanning_ dan membaca file gambar yang diunggah.
- **Backend:** Endpoint API `app/api/extract-ktp/route.ts` masih aktif digunakan. Endpoint ini menggunakan model `gemini-2.5-flash` dari Google AI SDK untuk mengekstrak 14 _field_ data (seperti NIK, Nama, Tanggal Lahir, Golongan Darah, dll) dari foto KTP dan mengirimkannya kembali ke form form data Guru.
- **Kesimpulan:** Jika memang fitur ini dianggap tidak perlu lagi di versi yang disederhanakan, Anda perlu menghapus UI _upload_ di halaman Manage Teachers dan menghapus file `route.ts` nya.

## 2. Fitur Multi-Masjid / Multi-Tenant (`mosque_id`)
**Status: SUDAH BERHASIL DIHAPUS (Hanya sisa teks statis dan skrip lama)**
Proses penyederhanaan dari _multi-tenant_ (banyak masjid) menjadi _single-tenant_ (satu masjid saja) sudah berhasil diterapkan pada level logika kode.
- **Logika Kode:** Tidak ditemukan lagi penggunaan variabel `mosque_id` di dalam folder `app/`, `components/`, maupun `lib/`.
- **Teks Statis (Hardcoded):** Aplikasi sekarang secara statis menggunakan nama **"MDA Masjid Nurul Huda"** di berbagai komponen UI (misalnya pada `components/pages/ManageTeachersPage.tsx` baris 278, `components/Sidebar.tsx`, `DashboardPage.tsx`, dll).
- **Role (Peran):** Role seperti `admin_masjid` sudah sepenuhnya hilang dari kode. Role yang tersisa hanya `superadmin`, `teacher`, dan `parent`.

## 3. File-file Skrip (Scripts/Seeders) Tidak Terpakai
**Status: BANYAK FILE USANG DI ROOT FOLDER**
Karena proyek ini mengalami banyak proses perombakan data dan migrasi, terdapat banyak file _script_ bantuan berbasis `.js` dan `.sql` di folder utama yang **sudah tidak terpakai oleh aplikasi Next.js**. File-file ini aman jika ingin Anda hapus untuk membersihkan (cleanup) repositori:
- `drop-mosque-cols.js`
- `migrate_add_ktp.js` (di dalam folder scripts)
- `seed-ali.js`, `seed-liju.js`, `seed-superadmin.js`, `seed-accounts.js`
- `scripts/seed.sql`
- `check_groups.js`, `check_constraint.js`, `update_constraint.js`
- `replace-alerts.js`, `fix-db.js`, `verify-users.js`
- `update-alfa.js`

## Kesimpulan Akhir
1. **Pekerjaan yang sukses:** Penghapusan sistem `multi-tenant` (multi-masjid) telah berhasil dilakukan. Aplikasi sekarang berjalan bersih sebagai aplikasi khusus 1 masjid.
2. **Pekerjaan yang tersisa (Jika diperlukan):** Fitur **Scan KTP** masih tertanam kuat di fitur "Kelola Guru". Jika Anda ingin membuangnya untuk tujuan penyederhanaan akhir, Anda harus menghapusnya dari `ManageTeachersPage.tsx` dan membuang folder `app/api/extract-ktp`. Selain itu, sangat disarankan untuk menghapus file-file script _dummy/migration_ di direktori utama agar kode terlihat jauh lebih rapi.
