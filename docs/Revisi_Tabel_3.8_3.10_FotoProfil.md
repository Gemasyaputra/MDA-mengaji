# Revisi Tabel 3.8 & 3.10 — Kolom Foto Profil (`users`, `students`)

> File baru, terpisah dari `laporan_TA_gema_syaputra_Print_bu_rika.docx` — dokumen aslinya
> **tidak diubah**. Salin bagian di bawah ini untuk menggantikan Tabel 3.8 dan Tabel 3.10 di
> BAB III (Perancangan Basisdata → 3.4.2 Struktur Tabel Basis Data) pada `.docx`.

## Alasan Revisi

Sistem aktual sudah punya fitur foto profil santri & guru — ditampilkan di ID Card santri,
daftar santri, serta layar Presensi/Setoran Tilawah/Setoran Doa di aplikasi mobile guru
(supaya guru mudah mengenali santri dari fotonya). Fitur ini belum tercermin di struktur
tabel `users` (Tabel 3.8) maupun `students` (Tabel 3.10).

Selain itu, tabel `students` juga belum mencantumkan kolom `teacher_note` — dipakai untuk
menampilkan banner "Catatan Guru" di dashboard pemantauan Wali Santri.

## Tabel 3.8 — Tabel `users` (Revisi)

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | bigint | 20 | primary key, auto_increment |
| name | varchar | 100 | |
| email | varchar | 100 | unique |
| password_hash | varchar | 255 | |
| role | varchar | 20 | |
| is_verified | boolean | | |
| verification_token | varchar | 255 | |
| phone | varchar | 20 | |
| photo_url | text | | Foto profil guru (opsional) |
| created_at | timestamp | | |

## Tabel 3.10 — Tabel `students` (Revisi)

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | bigint | 20 | primary key, auto_increment |
| group_id | bigint | 20 | foreign key ke tabel study_groups |
| name | varchar | 100 | |
| slug | varchar | 255 | unique |
| parent_name | varchar | 100 | |
| parent_phone | varchar | 20 | |
| birth_date | date | | |
| gender | char | 1 | |
| current_level | varchar | 50 | |
| reading_level | varchar | 20 | |
| iqro_graduated_at | timestamp | | |
| photo_url | text | | Foto santri (dipakai di ID Card, daftar santri, layar guru) |
| teacher_note | text | | Catatan guru, tampil sebagai banner di dashboard Wali Santri |
| created_at | timestamp | | |

---

**Status:** siap disalin ke `.docx`. Belum menyentuh berkas `.docx` aslinya.
