# Revisi Tabel 3.11 — Struktur Tabel `master_surahs`

> File baru, terpisah dari `laporan_TA_gema_syaputra_Print_bu_rika.docx` — dokumen aslinya
> **tidak diubah**. Salin bagian di bawah ini untuk menggantikan Tabel 3.11 di BAB III
> (Perancangan Basisdata → 3.4.2 Struktur Tabel Basis Data) pada `.docx`.

## Alasan Revisi

Kolom `juz` didokumentasikan sebagai `int(11)`, padahal tipe data aktual di sistem adalah
`varchar(50)`. Ini bukan sekadar beda tipe teknis — representasi letak juz suatu surah tidak
selalu berupa satu angka tunggal (banyak surah membentang lebih dari satu juz, mis. "1-2",
"28-29", dst.), sehingga tipe teks diperlukan, bukan integer. Kolom ini juga ditambahkan lewat
migrasi terpisah setelah tabel awal dibuat (`ALTER TABLE master_surahs ADD COLUMN IF NOT
EXISTS juz VARCHAR(50);`), bukan bagian dari struktur tabel awal.

## Tabel 3.11 — Tabel `master_surahs` (Revisi)

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | bigint | 20 | primary key, auto_increment |
| name_latin | varchar | 100 | |
| name_arabic | varchar | 100 | |
| total_verses | int | 11 | |
| revelation_type | varchar | 20 | Nilai: Makkiyah, Madaniyah |
| juz | varchar | 50 | Letak juz, mis. "1" atau "1-2" untuk surah lintas-juz |

---

**Status:** siap disalin ke `.docx`. Belum menyentuh berkas `.docx` aslinya.
