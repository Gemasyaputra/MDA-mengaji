# CATATAN REVISI BAB I & BAB II

> Dokumen ini berisi panduan finalisasi dari hasil revisi `BAB_I_Revisi.md`, `BAB_II_Revisi.md`, dan `Daftar_Pustaka_Revisi.md` ke berkas Microsoft Word akhir Tugas Akhir. Mengacu pada **Panduan TA D3 Jurusan TI Politeknik Negeri Padang** (Juni 2022).

---

## 1. Ringkasan Perubahan dari Draft Sebelumnya

### Yang Diperbaiki
- ✅ Hilangkan kata "penulis" → diganti kalimat pasif (panduan §4.3.b).
- ✅ Hilangkan duplikasi referensi [2] ≡ [3] di draft lama (keduanya Ardiansyah 2024).
- ✅ Perbaiki tertukarnya [6] (Schleier-Smith) dan [9] (Eismann) — sekarang konsisten.
- ✅ Hapus referensi *orphan* yang tidak pernah dikutip (Neon, Vercel di draft lama).
- ✅ Konsisten 3 aktor (Administrator, Guru, Wali Santri) sesuai panduan.
- ✅ Klaim "Server Components mengambil data langsung dari basis data" dihapus (tidak akurat — proyek pakai `'use client'` di semua halaman).
- ✅ Tambahkan sub-bab teknologi yang benar-benar dipakai di kode: **2.3.7 NextAuth dan Google OAuth 2.0**, **2.3.8 Vercel Blob Storage**.
- ✅ Tabel 2.1 ditata ulang menjadi tabel 4 kolom yang ringkas.

### Yang Dieksklusi (Sesuai Permintaan)
- ❌ **OCR KTP / Google Gemini AI** — tidak disebut sama sekali di BAB I & II.
- ❌ Multi-tenant — sistem dideklarasikan eksplisit *single-tenant*.
- ❌ Role *superadmin* — tidak disebut, hanya 3 aktor sesuai panduan.

---

## 2. Checklist Finalisasi di Microsoft Word

### A. Layout Dokumen (panduan §4.1)

- [ ] Ukuran kertas: **A4 (21 × 29,7 cm)**
- [ ] Orientasi: **Portrait**
- [ ] Margin: **Atas 4 cm | Bawah 3 cm | Kiri 4 cm | Kanan 3 cm**

### B. Tipografi (panduan §4.2)

- [ ] Font: **Times New Roman 12 pt**
- [ ] Spasi antar baris: **1,5 spasi**
- [ ] Spasi antara penunjuk bab (`BAB I`) dan judul bab (`PENDAHULUAN`): **2 spasi**
- [ ] Spasi antara judul bab dan teks pertama: **4 spasi**
- [ ] Spasi antara judul sub-bab dan teks pertama: **2 spasi**
- [ ] Alinea baru menjorok **5 ketukan** dari margin kiri
- [ ] Spasi antara akhir paragraf dan judul sub-bab berikutnya: **4 spasi**
- [ ] Setiap awal Bab dimulai pada **halaman baru**
- [ ] Judul bab: **HURUF KAPITAL, BOLD**
- [ ] Judul sub-bab: **Title Case (kapital awal tiap kata) kecuali kata fungsi, BOLD**

### C. Penomoran (panduan §4.11)

- [ ] Nomor bab pakai **angka romawi** (BAB I, BAB II)
- [ ] Sub-bab pakai **desimal** (1.1, 1.2, 1.1.1) tanpa titik di akhir
- [ ] Daftar a, b, c di dalam sub-bab pakai **huruf kecil + titik**
- [ ] Daftar (1), (2), (3) di dalam huruf pakai **angka dalam kurung tanpa titik**
- [ ] Nomor halaman: bagian inti (BAB I dst) = angka latin di **bawah-kanan** untuk halaman bab, **atas-kanan** untuk halaman lainnya

### D. Bahasa & Istilah Asing (panduan §4.3)

- [ ] Pastikan tidak ada kata ganti orang (saya, kami, penulis, peneliti) — gunakan kalimat pasif.
- [ ] Italic semua istilah asing yang belum punya padanan baku Indonesia. Daftar yang **harus di-italic** di Word:
  - *full-stack*, *single-tenant*, *real-time*, *Mobile-First Design*
  - *Server-Side Rendering* (SSR), *Static Site Generation* (SSG)
  - *Client Components*, *App Router*, *framework*
  - *cold start*, *connection pooling*, *suspend timeout*, *scale-to-zero*
  - *compute-storage separation*, *compute endpoint*
  - *Object-Relational Mapping*, *type-safe*, *schema manager*
  - *raw SQL*, *parameterized query*, *SQL Injection*
  - *utility-first*, *purging*, *bundle*, *markup*
  - *Single Sign-On* (SSO), *JSON Web Token* (JWT), *open-source*
  - *Routes*, *backend*, *frontend*, *toast*, *bulk*, *slug*
  - *Waterfall*, *Requirement*, *Design*, *Implementation*, *Coding*, *Testing*, *Black Box Testing*, *User Acceptance Testing* (UAT), *Operation & Maintenance*
  - *dashboard*, *e-commerce*, *cloud computing*, *cloud*, *login*, *view-only*, *smartphone*, *desktop*
  - *deployment*, *response*, *request*, *payload*, *foreign key*

### E. Sitasi & Daftar Pustaka (panduan §4.12 dan §4.13)

- [ ] Format sitasi: **gaya IEEE numerik** `[1]`, `[2]`, dst.
- [ ] Pastikan setiap nomor sitasi `[n]` di teks **sudah benar-benar muncul** di Daftar Pustaka.
- [ ] Pastikan setiap entri di Daftar Pustaka **sudah benar-benar dikutip** di teks (lihat tabel pemetaan di `Daftar_Pustaka_Revisi.md`).
- [ ] Daftar Pustaka pakai **Word > References > Insert Bibliography** (jika sudah pakai Word reference manager) atau ketik manual sesuai format IEEE.
- [ ] Setiap entri pustaka spasi **1**, antar entri spasi **2**.

### F. Tabel & Gambar

- [ ] Tabel 2.1 (Kajian Pustaka): pastikan border standar Word, header **bold + center**, body **rata kiri**.
- [ ] Penomoran tabel/gambar dimulai di setiap bab: **Tabel 2.1**, **Tabel 2.2**, **Gambar 2.1**, dst.
- [ ] Caption tabel: **di atas** tabel; caption gambar: **di bawah** gambar.
- [ ] Spasi antara teks dan tabel/gambar: **3 spasi**.

### G. Halaman Awal yang Belum Disusun

Berdasarkan urutan naskah D3 Manajemen Informatika di panduan §5.1, masih perlu disiapkan:

- [ ] Lembar Judul (Cover) — pakai template lampiran panduan
- [ ] Lembar Perolehan Gelar
- [ ] Lembar Persetujuan/Pengesahan
- [ ] Lembar Penguji
- [ ] **Abstrak (Indonesia)** — maksimal 200 kata, 1 alinea, harus menjawab 4 pertanyaan: (1) Mengapa penelitian dilakukan, (2) Apa objek penelitian, (3) Bagaimana penelitian diselesaikan, (4) Kesimpulan. Diakhiri 4–5 kata kunci **bold**.
- [ ] **Abstract (English)** — versi Inggris dari abstrak Indonesia.
- [ ] Kata Pengantar
- [ ] Halaman Persembahan (opsional)
- [ ] Daftar Isi (gunakan **Word > References > Table of Contents**)
- [ ] Daftar Tabel
- [ ] Daftar Gambar
- [ ] Daftar Lampiran

---

## 3. Catatan Teknis untuk Konsistensi Kode (Di Luar Skripsi)

Karena Anda menyatakan **fitur OCR KTP sudah tidak dipakai**, agar kode konsisten dengan skripsi, sebaiknya nanti dilakukan pembersihan berikut (di luar pekerjaan dokumen ini):

- [ ] Hapus folder `app/api/extract-ktp/`
- [ ] Hapus berkas `public/video_upload_ktp_ai.mp4`
- [ ] Hapus dependency `@ai-sdk/google` dan `ai` dari `package.json`
- [ ] Sederhanakan form pendaftaran guru di `components/pages/ManageTeachersPage.tsx` agar tidak ada tombol upload KTP, tapi langsung input manual semua field
- [ ] Tinjau kembali kolom `nik`, `tempat_lahir`, dst di tabel `users` — apakah masih perlu, atau sebaiknya dihapus juga via migrasi

Pekerjaan ini bisa dijadwalkan setelah skripsi disetujui pembimbing.

---

## 4. Tinjauan Bab III (Sudah Selesai Sebelumnya)

Dokumen `BAB_III_Analisis_Sistem.md` yang dibuat sebelumnya **masih bisa dipakai sebagai bahan baku BAB III**, tetapi perlu disesuaikan untuk:

- [ ] **Hapus seksi tentang OCR KTP / Gemini AI** (Alur 5 di sub-bab 3.2.5).
- [ ] Selaraskan jumlah aktor menjadi 3 (Administrator, Guru, Wali Santri) — hapus referensi *Super Admin*.
- [ ] Konversi Mermaid diagram (ERD, Use Case, Sequence Diagram) menjadi **gambar PNG** via mermaid.live atau plugin Word, lalu sisipkan sebagai Gambar 3.x.
- [ ] Pertahankan tabel skema basis data dan daftar endpoint API.

Saya sarankan kita kerjakan revisi BAB III di sesi terpisah setelah BAB I & II Anda final.

---

## 5. Status File

| File | Status |
|---|---|
| `docs/BAB_I_Revisi.md` | ✅ Selesai |
| `docs/BAB_II_Revisi.md` | ✅ Selesai |
| `docs/Daftar_Pustaka_Revisi.md` | ✅ Selesai |
| `docs/Catatan_Revisi.md` | ✅ Selesai (file ini) |
| `docs/BAB_III_Analisis_Sistem.md` | ⚠️ Perlu revisi (hapus OCR KTP, hapus Super Admin) |

---

## 6. Langkah Selanjutnya yang Disarankan

1. **Buka `BAB_I_Revisi.md` dan `BAB_II_Revisi.md`** di VSCode/Word, salin konten ke berkas `.docx` Anda yang sudah ada.
2. **Lakukan checklist tata tulis** di seksi 2 di atas (italic istilah asing, format Word, dst).
3. **Periksa setiap sitasi** menggunakan tabel pemetaan di `Daftar_Pustaka_Revisi.md`.
4. **Mintakan review pembimbing** — jika ada saran, kabari saya untuk iterasi berikutnya.
5. Setelah BAB I & II clean, baru kita lanjutkan **revisi BAB III** dengan menyesuaikan keputusan terakhir (tanpa OCR KTP, 3 aktor saja).
