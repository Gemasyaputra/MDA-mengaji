# Revisi Tabel 3.14 — Struktur Tabel `attendance`

> File baru, terpisah dari `laporan_TA_gema_syaputra_Print_bu_rika.docx` — dokumen aslinya
> **tidak diubah**. Salin bagian di bawah ini untuk menggantikan Tabel 3.14 di BAB III
> (Perancangan Basisdata → 3.4.2 Struktur Tabel Basis Data) pada `.docx`.

## Alasan Revisi

Struktur tabel `attendance` di dokumen saat ini (Tabel 3.14) belum mencantumkan kolom
`session` dan `time`. Ini bukan detail kecil — seluruh alur fitur Presensi pada sistem
aktual (baik web `PresensiPage` maupun mobile `TeacherAttendanceScreen`) dibangun di
sekitar konsep **3 sesi pencatatan per hari (Pagi/Siang/Sore)**, bukan satu presensi per
hari seperti yang tersirat dari struktur tabel yang didokumentasikan sekarang. Tanpa kolom
`session`, tabel yang didokumentasikan tidak bisa merepresentasikan kenyataan bahwa satu
santri bisa punya lebih dari satu catatan presensi pada tanggal yang sama (mis. hadir sesi
Pagi, tidak hadir sesi Siang).

## Tabel 3.14 — Tabel `attendance` (Revisi)

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | bigint | 20 | primary key, auto_increment |
| student_id | bigint | 20 | foreign key ke tabel students |
| teacher_id | bigint | 20 | foreign key ke tabel users |
| date | date | | Tanggal presensi |
| session | varchar | 10 | Sesi pencatatan; nilai: PAGI, SIANG, SORE (default PAGI) |
| time | time | | Jam santri ditandai hadir (opsional) |
| status | varchar | 10 | Nilai: HADIR, SAKIT, IZIN, ALFA |
| notes | text | | Catatan tambahan dari guru (opsional) |
| created_at | timestamp | | |

## Penyesuaian lain yang mengikuti (kalau ada di dokumen)

Kalau ERD (Gambar 3.24) atau narasi ERD di sub-bab 3.4.1 turut menyebutkan atribut tabel
`attendance` secara eksplisit, tambahkan `session` dan `time` di sana juga supaya konsisten
dengan tabel di atas.

Kalimat narasi yang bisa ditambahkan di sub-bab 3.4.1 (opsional, kalau ingin dijelaskan di
teks, bukan cuma di tabel):

> Tabel `attendance` menyimpan presensi santri per sesi kegiatan mengaji, ditandai melalui
> kolom `session` (Pagi/Siang/Sore) — sehingga satu santri dapat memiliki lebih dari satu
> catatan presensi pada tanggal yang sama apabila mengikuti lebih dari satu sesi.

---

**Status:** siap disalin ke `.docx`. Belum menyentuh berkas `.docx` aslinya.
