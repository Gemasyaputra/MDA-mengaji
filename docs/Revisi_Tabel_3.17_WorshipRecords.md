# Revisi Tabel 3.17 — Struktur Tabel `worship_records`

> File baru, terpisah dari `laporan_TA_gema_syaputra_Print_bu_rika.docx` — dokumen aslinya
> **tidak diubah**. Salin bagian di bawah ini untuk menggantikan Tabel 3.17 di BAB III
> (Perancangan Basisdata → 3.4.2 Struktur Tabel Basis Data) pada `.docx`.

## Alasan Revisi

Revisi ini paling penting dibanding revisi tabel lain, karena tabel `worship_records` yang
didokumentasikan sekarang sebenarnya **tidak cukup lengkap** untuk mendukung fitur yang
justru sudah dideskripsikan di bagian lain dokumen yang sama — Sequence Diagram & Activity
Diagram #16 "menginput data sholat" menjelaskan **Wali Santri bisa mencatat sholat sendiri**
di rumah (fitur "Catat Sholat di Rumah"), tapi tabel `worship_records` di Tabel 3.17 belum
punya kolom untuk membedakan input guru vs input orang tua. Ini kontradiksi internal di
dokumen yang perlu diselesaikan.

1. **Kolom `quality` didokumentasikan sebagai `char(1)`**, sama seperti `learning_records` —
   sistem aktual pakai skala angka 1–10 (`CHECK (quality IS NULL OR quality BETWEEN 1 AND
   10)` — nullable karena tidak semua jenis setoran ibadah dinilai dengan angka).
2. **Belum ada kolom `recorded_by`** — menandai apakah catatan dibuat oleh Guru (`TEACHER`)
   atau Wali Santri (`PARENT`). Kolom `teacher_id` di tabel ini juga perlu diubah jadi
   **nullable**, karena saat Wali Santri yang input, tidak ada `teacher_id` (wali santri tidak
   punya akun guru).
3. **Belum ada kolom `prayer_name`** — nama sholat spesifik untuk tipe `SALAT_FARDU`/
   `SALAT_SUNAH` (mis. "Subuh", "Salat Duha"), dipakai saat Wali Santri mencatat sholat di
   rumah tanpa mengacu ke Bank Materi (`daily_prayer_id`/`prayer_reading_id`).
4. **Belum ada kolom `notes`** — catatan tambahan dari guru saat mencatat setoran hafalan
   doa/bacaan sholat.
5. **Nilai `type` bertambah** — dokumen menyebut tipe `DOA_HARIAN`/`BACAAN_SHOLAT` saja,
   sistem aktual menambah `SALAT_FARDU`/`SALAT_SUNAH` untuk mendukung fitur pencatatan sholat
   wajib/sunah (baik oleh guru maupun wali santri).

## Tabel 3.17 — Tabel `worship_records` (Revisi)

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | bigint | 20 | primary key, auto_increment |
| student_id | bigint | 20 | foreign key ke tabel students |
| teacher_id | bigint | 20 | foreign key ke tabel users, **nullable** |
| date | date | | |
| type | varchar | 20 | Nilai: DOA_HARIAN, BACAAN_SHOLAT, SALAT_FARDU, SALAT_SUNAH |
| daily_prayer_id | bigint | 20 | foreign key ke tabel master_daily_prayers, nullable |
| prayer_reading_id | bigint | 20 | foreign key ke tabel master_prayer_readings, nullable |
| prayer_name | varchar | 50 | Nama sholat (mis. "Subuh"), untuk tipe SALAT_FARDU/SALAT_SUNAH |
| is_completed | boolean | | |
| quality | integer | | Nilai 1–10, nullable |
| recorded_by | varchar | 20 | Nilai: TEACHER, PARENT (default TEACHER) |
| notes | text | | |
| created_at | timestamp | | |

---

**Status:** siap disalin ke `.docx`. Belum menyentuh berkas `.docx` aslinya.
