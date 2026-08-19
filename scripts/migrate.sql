-- ==========================================
-- BAGIAN 1: MASTER DATA (REFERENCE TABLES)
-- ==========================================

-- 1. Master Data Surah Al-Quran (Standard Kemenag)
CREATE TABLE IF NOT EXISTS master_surahs (
    id BIGSERIAL PRIMARY KEY,
    name_latin VARCHAR(100) NOT NULL,
    name_arabic VARCHAR(100),
    total_verses INT NOT NULL,
    revelation_type VARCHAR(20) CHECK (revelation_type IN ('Makkiyah', 'Madaniyah')),
    juz VARCHAR(50)
);

-- 2. Master Data Doa Harian
CREATE TABLE IF NOT EXISTS master_daily_prayers (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    arabic_text TEXT,
    latin_text TEXT,
    translation TEXT
);

-- 3. Master Data Bacaan Sholat
CREATE TABLE IF NOT EXISTS master_prayer_readings (
    id BIGSERIAL PRIMARY KEY,
    step_order INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    arabic_text TEXT,
    translation TEXT
);

-- ==========================================
-- BAGIAN 2: STRUKTUR UTAMA (CORE TABLES)
-- ==========================================


-- 5. Tabel Users (Admin & Pengajar)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    jenis_kelamin VARCHAR(20),
    alamat TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Kelompok Belajar
CREATE TABLE IF NOT EXISTS study_groups (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- 7. Tabel Santri
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES study_groups(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(1) CHECK (gender IN ('L', 'P')),
    address TEXT,
    current_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Presensi
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('HADIR', 'SAKIT', 'IZIN', 'ALFA')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- BAGIAN 3: TABEL TRANSAKSI (UPDATED)
-- ==========================================

-- 9. Tabel Log Mengaji (Bacaan/Simak)
CREATE TABLE IF NOT EXISTS learning_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IQRO', 'QURAN')),
    level_or_surah VARCHAR(50) NOT NULL,
    start_point VARCHAR(20) NOT NULL,
    end_point VARCHAR(20) NOT NULL,
    quality VARCHAR(1) NOT NULL CHECK (quality IN ('A', 'B', 'C', 'D')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabel Log Hafalan (Tahfidz)
CREATE TABLE IF NOT EXISTS memorization_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    surah_id BIGINT NOT NULL REFERENCES master_surahs(id),
    verse_start INT NOT NULL,
    verse_end INT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ZIYADAH', 'MURAJAAH')),
    quality VARCHAR(20) NOT NULL CHECK (quality IN ('LANCAR', 'KURANG', 'ULANG')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabel Log Ibadah & Doa
CREATE TABLE IF NOT EXISTS worship_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DOA_HARIAN', 'BACAAN_SHOLAT')),
    daily_prayer_id BIGINT REFERENCES master_daily_prayers(id),
    prayer_reading_id BIGINT REFERENCES master_prayer_readings(id),
    is_completed BOOLEAN DEFAULT FALSE,
    quality VARCHAR(1) CHECK (quality IN ('A', 'B', 'C')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabel Dokumentasi (News Feed)
CREATE TABLE IF NOT EXISTS activity_posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES activity_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADD JUZ COLUMN
ALTER TABLE master_surahs ADD COLUMN IF NOT EXISTS juz VARCHAR(50);

-- ADD READING LEVEL COLUMNS
ALTER TABLE students ADD COLUMN IF NOT EXISTS reading_level VARCHAR(20) DEFAULT 'IQRO' CHECK (reading_level IN ('IQRO', 'ALQURAN'));
ALTER TABLE students ADD COLUMN IF NOT EXISTS iqro_graduated_at TIMESTAMP;

-- ADD PROFILE PHOTO COLUMNS (Guru & Santri)
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ADD MATERI PDF/LINK COLUMNS (arabic_text tetap ada, jadi opsional di UI)
ALTER TABLE master_daily_prayers ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE master_daily_prayers ADD COLUMN IF NOT EXISTS external_link TEXT;
ALTER TABLE master_prayer_readings ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE master_prayer_readings ADD COLUMN IF NOT EXISTS external_link TEXT;

-- ADD SALAT FARDU/SUNAH TRACKING (worship_records)
ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_type_check;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_type_check
  CHECK (type IN ('DOA_HARIAN', 'BACAAN_SHOLAT', 'SALAT_FARDU', 'SALAT_SUNAH'));
ALTER TABLE worship_records ADD COLUMN IF NOT EXISTS prayer_name VARCHAR(50);

-- ADD TEACHER NOTE FOR TARGET/WARNING TRACKING
ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_note TEXT;

-- ADD SESSION (PAGI/SIANG) TO ATTENDANCE
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS session VARCHAR(10) NOT NULL DEFAULT 'PAGI' CHECK (session IN ('PAGI', 'SIANG'));

-- ADD TIME (JAM PRESENSI) TO ATTENDANCE
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS time TIME;

-- ADD SORE AS A THIRD ATTENDANCE SESSION (PAGI/SIANG/SORE)
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_session_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_session_check
  CHECK (session IN ('PAGI', 'SIANG', 'SORE'));

-- CHANGE NILAI (QUALITY) FROM LETTER TO ANGKA (1-10) ON SETORAN TILAWAH (learning_records)
-- AND CATAT HAFALAN / SETORAN DOA (worship_records). Mapping existing letters: A=10, B=8, C=6, D=4.
-- Dibungkus DO block + cek tipe kolom supaya aman dijalankan berkali-kali (idempotent) —
-- ALTER COLUMN TYPE ke INTEGER hanya jalan sekali saat kolom masih varchar.
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'learning_records' AND column_name = 'quality') <> 'integer' THEN
    ALTER TABLE learning_records DROP CONSTRAINT IF EXISTS learning_records_quality_check;
    ALTER TABLE learning_records ALTER COLUMN quality TYPE INTEGER USING (
      CASE quality WHEN 'A' THEN 10 WHEN 'B' THEN 8 WHEN 'C' THEN 6 WHEN 'D' THEN 4 ELSE quality::INTEGER END
    );
  END IF;
END $$;
ALTER TABLE learning_records DROP CONSTRAINT IF EXISTS learning_records_quality_check;
ALTER TABLE learning_records ADD CONSTRAINT learning_records_quality_check CHECK (quality BETWEEN 1 AND 10);

-- ADD READING STATUS (LANCAR/MENGULANG) TO SETORAN TILAWAH
ALTER TABLE learning_records ADD COLUMN IF NOT EXISTS reading_status VARCHAR(20) NOT NULL DEFAULT 'LANCAR';
ALTER TABLE learning_records DROP CONSTRAINT IF EXISTS learning_records_reading_status_check;
ALTER TABLE learning_records ADD CONSTRAINT learning_records_reading_status_check
  CHECK (reading_status IN ('LANCAR', 'MENGULANG'));

DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'worship_records' AND column_name = 'quality') <> 'integer' THEN
    ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_quality_check;
    ALTER TABLE worship_records ALTER COLUMN quality TYPE INTEGER USING (
      CASE quality WHEN 'A' THEN 10 WHEN 'B' THEN 8 WHEN 'C' THEN 6 ELSE quality::INTEGER END
    );
  END IF;
END $$;
ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_quality_check;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_quality_check CHECK (quality IS NULL OR quality BETWEEN 1 AND 10);

-- ADD NOTES (CATATAN GURU) TO WORSHIP_RECORDS — form sudah mengirim field ini tapi belum pernah tersimpan
ALTER TABLE worship_records ADD COLUMN IF NOT EXISTS notes TEXT;

-- ALLOW PARENTS TO INPUT SHOLAT FARDU/SUNAH (worship_records)
-- teacher_id jadi nullable karena orang tua yang input tidak punya akun guru.
ALTER TABLE worship_records ALTER COLUMN teacher_id DROP NOT NULL;
ALTER TABLE worship_records ADD COLUMN IF NOT EXISTS recorded_by VARCHAR(20) NOT NULL DEFAULT 'TEACHER';
ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_recorded_by_check;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_recorded_by_check
  CHECK (recorded_by IN ('TEACHER', 'PARENT'));
ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_recorded_by_teacher_consistency;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_recorded_by_teacher_consistency
  CHECK (
    (recorded_by = 'TEACHER' AND teacher_id IS NOT NULL) OR
    (recorded_by = 'PARENT' AND teacher_id IS NULL)
  );

-- PREFIX USTADZ/USTADZAH: pastikan kolom jenis_kelamin ada, lalu bersihkan data guru yang
-- sudah mengetik prefix manual di kolom nama tapi belum punya data jenis_kelamin.
ALTER TABLE users ADD COLUMN IF NOT EXISTS jenis_kelamin VARCHAR(20);

UPDATE users SET
  jenis_kelamin = 'PEREMPUAN',
  name = trim(regexp_replace(name, '^Ustadzah\s+', '', 'i'))
WHERE role = 'teacher' AND jenis_kelamin IS NULL AND name ~* '^Ustadzah\s';

UPDATE users SET
  jenis_kelamin = 'LAKI-LAKI',
  name = trim(regexp_replace(name, '^Ustadz\s+', '', 'i'))
WHERE role = 'teacher' AND jenis_kelamin IS NULL AND name ~* '^Ustadz\s' AND name !~* '^Ustadzah\s';

-- (Reverted) is_verified column on Bank Materi was added then removed per user request.
ALTER TABLE master_daily_prayers DROP COLUMN IF EXISTS is_verified;
ALTER TABLE master_prayer_readings DROP COLUMN IF EXISTS is_verified;

-- Komentar pada Kabar/Aktivitas tidak pernah dipakai (tidak ada API/UI) — fitur dihapus.
DROP TABLE IF EXISTS activity_comments;

-- STANDARISASI KODE STATUS ALFA (bukan ALPA) — mobile selalu kirim 'ALFA', DB & sebagian web
-- masih pakai 'ALPA', migrasi data lama + perbarui constraint supaya konsisten.
UPDATE attendance SET status = 'ALFA' WHERE status = 'ALPA';
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check
  CHECK (status IN ('HADIR', 'SAKIT', 'IZIN', 'ALFA'));

-- ==========================================================================
-- STANDARISASI PRIMARY KEY (permintaan dosen pembimbing)
--   1. Setiap primary key diganti nama dari `id` menjadi `id_<nama_tabel>`.
--   2. Setiap primary key dan foreign key diubah tipenya dari BIGINT/BIGSERIAL
--      ke INTEGER biasa.
-- Catatan: blok CREATE TABLE di BAGIAN 1-3 di atas masih menuliskan
-- `id BIGSERIAL PRIMARY KEY` — itu bentuk historis untuk instalasi baru;
-- begitu tabel dibuat, blok di bawah ini langsung menstandarisasi ulang nama
-- dan tipe kolomnya pada run yang sama, jadi hasil akhirnya tetap konsisten
-- baik untuk instalasi baru maupun database yang sudah berjalan.
-- Data saat ini masih dummy sehingga migrasi ini tidak butuh logic
-- preservasi data khusus. Seluruh blok idempotent (aman dijalankan berkali-kali
-- lewat `npm run migrate`).
-- ==========================================================================

-- Langkah 1: lepas SEMUA foreign key pada 12 tabel target. Nama constraint
-- tidak di-hardcode (baik yang dibuat inline oleh file ini maupun oleh
-- drizzle-kit) supaya DROP-nya selalu tepat sasaran.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.conrelid::regclass AS tbl, c.conname
    FROM pg_constraint c
    WHERE c.contype = 'f'
      AND c.conrelid::regclass::text IN (
        'users','master_surahs','master_daily_prayers','master_prayer_readings',
        'study_groups','students','attendance','learning_records',
        'memorization_records','worship_records','activity_posts','activity_images'
      )
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
  END LOOP;
END $$;

-- Langkah 2: rename kolom PK `id` -> `id_<tabel>` (hanya jika masih bernama `id`).
-- RENAME COLUMN otomatis membawa serta constraint PK, index, dan default
-- nextval, jadi tidak perlu menyentuh <tabel>_pkey secara manual.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','master_surahs','master_daily_prayers','master_prayer_readings',
    'study_groups','students','attendance','learning_records',
    'memorization_records','worship_records','activity_posts','activity_images'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'id'
    ) THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN id TO %I', t, 'id_' || t);
    END IF;
  END LOOP;
END $$;

-- Langkah 3: ubah tipe kolom PK dan FK dari BIGINT ke INTEGER pada 12 tabel target.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type = 'bigint'
      AND table_name IN (
        'users','master_surahs','master_daily_prayers','master_prayer_readings',
        'study_groups','students','attendance','learning_records',
        'memorization_records','worship_records','activity_posts','activity_images'
      )
      AND (column_name LIKE 'id\_%' OR column_name LIKE '%\_id')
  LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE INTEGER', r.table_name, r.column_name);
  END LOOP;
END $$;

-- Langkah 4: sequence bekas BIGSERIAL juga diturunkan ke INTEGER supaya benar-benar
-- setara SERIAL. Nama sequence tetap <tabel>_id_seq (RENAME COLUMN tidak merename
-- sequence) — default nextval() menunjuk lewat OID sehingga tetap valid.
DO $$
DECLARE seqname TEXT;
BEGIN
  FOREACH seqname IN ARRAY ARRAY[
    'users_id_seq','master_surahs_id_seq','master_daily_prayers_id_seq',
    'master_prayer_readings_id_seq','study_groups_id_seq','students_id_seq',
    'attendance_id_seq','learning_records_id_seq','memorization_records_id_seq',
    'worship_records_id_seq','activity_posts_id_seq','activity_images_id_seq'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = seqname) THEN
      EXECUTE format('ALTER SEQUENCE %I AS INTEGER MAXVALUE 2147483647', seqname);
    END IF;
  END LOOP;
END $$;

-- Langkah 5: pasang kembali seluruh foreign key, sekarang menunjuk ke nama PK
-- yang baru. Nama FK dieksplisitkan supaya stabil dan DROP CONSTRAINT IF EXISTS
-- di run berikutnya selalu cocok. Urutan parent -> child.
ALTER TABLE study_groups DROP CONSTRAINT IF EXISTS study_groups_teacher_id_fkey;
ALTER TABLE study_groups ADD CONSTRAINT study_groups_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES users(id_users) ON DELETE SET NULL;

ALTER TABLE students DROP CONSTRAINT IF EXISTS students_group_id_fkey;
ALTER TABLE students ADD CONSTRAINT students_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES study_groups(id_study_groups) ON DELETE SET NULL;

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE attendance ADD CONSTRAINT attendance_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES students(id_students) ON DELETE CASCADE;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_teacher_id_fkey;
ALTER TABLE attendance ADD CONSTRAINT attendance_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES users(id_users);

ALTER TABLE learning_records DROP CONSTRAINT IF EXISTS learning_records_student_id_fkey;
ALTER TABLE learning_records ADD CONSTRAINT learning_records_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES students(id_students) ON DELETE CASCADE;
ALTER TABLE learning_records DROP CONSTRAINT IF EXISTS learning_records_teacher_id_fkey;
ALTER TABLE learning_records ADD CONSTRAINT learning_records_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES users(id_users);

ALTER TABLE memorization_records DROP CONSTRAINT IF EXISTS memorization_records_student_id_fkey;
ALTER TABLE memorization_records ADD CONSTRAINT memorization_records_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES students(id_students) ON DELETE CASCADE;
ALTER TABLE memorization_records DROP CONSTRAINT IF EXISTS memorization_records_teacher_id_fkey;
ALTER TABLE memorization_records ADD CONSTRAINT memorization_records_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES users(id_users);
ALTER TABLE memorization_records DROP CONSTRAINT IF EXISTS memorization_records_surah_id_fkey;
ALTER TABLE memorization_records ADD CONSTRAINT memorization_records_surah_id_fkey
  FOREIGN KEY (surah_id) REFERENCES master_surahs(id_master_surahs);

ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_student_id_fkey;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES students(id_students) ON DELETE CASCADE;
ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_teacher_id_fkey;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES users(id_users);
ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_daily_prayer_id_fkey;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_daily_prayer_id_fkey
  FOREIGN KEY (daily_prayer_id) REFERENCES master_daily_prayers(id_master_daily_prayers);
ALTER TABLE worship_records DROP CONSTRAINT IF EXISTS worship_records_prayer_reading_id_fkey;
ALTER TABLE worship_records ADD CONSTRAINT worship_records_prayer_reading_id_fkey
  FOREIGN KEY (prayer_reading_id) REFERENCES master_prayer_readings(id_master_prayer_readings);

ALTER TABLE activity_posts DROP CONSTRAINT IF EXISTS activity_posts_author_id_fkey;
ALTER TABLE activity_posts ADD CONSTRAINT activity_posts_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES users(id_users);

ALTER TABLE activity_images DROP CONSTRAINT IF EXISTS activity_images_post_id_fkey;
ALTER TABLE activity_images ADD CONSTRAINT activity_images_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES activity_posts(id_activity_posts) ON DELETE CASCADE;

-- ==========================================
-- BAGIAN X: GURU PENGGANTI (WALI KELAS SEMENTARA)
-- ==========================================
-- Kolom opsional di study_groups untuk menunjuk guru pengganti saat wali kelas
-- tetap (teacher_id) berhalangan hadir. Tidak mengubah kepemilikan asli — hanya
-- diberi akses baca/tulis yang sama ke data kelas itu di endpoint yang relevan.
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS substitute_teacher_id BIGINT;
ALTER TABLE study_groups DROP CONSTRAINT IF EXISTS study_groups_substitute_teacher_id_fkey;
ALTER TABLE study_groups ADD CONSTRAINT study_groups_substitute_teacher_id_fkey
  FOREIGN KEY (substitute_teacher_id) REFERENCES users(id_users) ON DELETE SET NULL;