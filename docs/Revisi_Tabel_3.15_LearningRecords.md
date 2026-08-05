# Revisi Tabel 3.15 — Struktur Tabel `learning_records`

> File baru, terpisah dari `laporan_TA_gema_syaputra_Print_bu_rika.docx` — dokumen aslinya
> **tidak diubah**. Salin bagian di bawah ini untuk menggantikan Tabel 3.15 di BAB III
> (Perancangan Basisdata → 3.4.2 Struktur Tabel Basis Data) pada `.docx`.

## Alasan Revisi

1. **Kolom `quality` didokumentasikan sebagai `char(1)`** (nilai huruf A–D), padahal sistem
   aktual sudah diganti jadi **skala angka 1–10**. Bukti dari `scripts/migrate.sql`:
   *"CHANGE NILAI (QUALITY) FROM LETTER TO ANGKA (1-10) ON SETORAN TILAWAH (learning_records)…
   Mapping existing letters: A=10, B=8, C=6, D=4"*, dengan constraint aktual
   `CHECK (quality BETWEEN 1 AND 10)`.
2. **Belum ada kolom `reading_status`** — fitur di mana guru bisa menandai setoran tilawah
   santri sebagai "Mengulang" (perlu diulang besok) atau "Lancar", ditampilkan di layar
   Setoran Tilawah mobile maupun riwayat setoran web.

## Tabel 3.15 — Tabel `learning_records` (Revisi)

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | bigint | 20 | primary key, auto_increment |
| student_id | bigint | 20 | foreign key ke tabel students |
| teacher_id | bigint | 20 | foreign key ke tabel users |
| date | date | | |
| type | varchar | 10 | Nilai: IQRO, QURAN |
| level_or_surah | varchar | 100 | |
| start_point | varchar | 50 | |
| end_point | varchar | 50 | |
| quality | integer | | Nilai 1–10 |
| reading_status | varchar | 20 | Nilai: LANCAR, MENGULANG (default LANCAR) |
| notes | text | | |
| created_at | timestamp | | |

---

**Status:** siap disalin ke `.docx`. Belum menyentuh berkas `.docx` aslinya.
