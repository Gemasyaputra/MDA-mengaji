import {
  serial,
  varchar,
  text,
  integer,
  date,
  timestamp,
  boolean,
  pgTable,
  check,
  time,
} from "drizzle-orm/pg-core";

// Catatan standarisasi PK: nama kolom DB memakai pola `id_<tabel>` (permintaan
// dosen pembimbing), tapi nama properti JS di semua tabel di bawah tetap `id`
// (lewat argumen string Drizzle, contoh `serial("id_students")`). Ini sengaja
// dipertahankan supaya seluruh pemakaian `.id` / `.references(() => x.id)` di
// codebase tidak perlu diubah — jangan "dirapikan" jadi `idStudents` dkk.

// ==================== MASTER DATA ====================

export const masterSurahs = pgTable("master_surahs", {
  id: serial("id_master_surahs").primaryKey(),
  nameLatin: varchar("name_latin", { length: 100 }).notNull(),
  nameArabic: varchar("name_arabic", { length: 100 }),
  totalVerses: integer("total_verses").notNull(),
  revelationType: varchar("revelation_type", { length: 20 }).notNull(),
  juz: varchar("juz", { length: 50 }),
});

export const masterDailyPrayers = pgTable("master_daily_prayers", {
  id: serial("id_master_daily_prayers").primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }),
  arabicText: text("arabic_text"),
  latinText: text("latin_text"),
  translation: text("translation"),
  pdfUrl: text("pdf_url"),
  externalLink: text("external_link"),
});

export const masterPrayerReadings = pgTable("master_prayer_readings", {
  id: serial("id_master_prayer_readings").primaryKey(),
  stepOrder: integer("step_order").notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }),
  arabicText: text("arabic_text"),
  translation: text("translation"),
  pdfUrl: text("pdf_url"),
  externalLink: text("external_link"),
});

// ==================== CORE TABLES ====================


export const users = pgTable("users", {
  id: serial("id_users").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 20 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  photoUrl: text("photo_url"),
  jenisKelamin: varchar("jenis_kelamin", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studyGroups = pgTable("study_groups", {
  id: serial("id_study_groups").primaryKey(),
  teacherId: integer("teacher_id").references(
    () => users.id,
    {
      onDelete: "set null",
    },
  ),
  // Wali kelas sementara (opsional) — dipakai saat wali kelas tetap berhalangan
  // hadir. Diberi akses yang sama seperti teacherId ke data kelas ini di semua
  // query "kelas milik saya", tanpa mengubah kepemilikan (teacherId) aslinya.
  substituteTeacherId: integer("substitute_teacher_id").references(
    () => users.id,
    {
      onDelete: "set null",
    },
  ),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
});

export const students = pgTable("students", {
  id: serial("id_students").primaryKey(),
  groupId: integer("group_id").references(
    () => studyGroups.id,
  ),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  parentName: varchar("parent_name", { length: 100 }),
  parentPhone: varchar("parent_phone", { length: 20 }),
  birthDate: date("birth_date"),
  gender: varchar("gender", { length: 1 }),
  address: text("address"),
  currentLevel: varchar("current_level", { length: 50 }),
  readingLevel: varchar("reading_level", { length: 20, enum: ['IQRO', 'ALQURAN'] }).default('IQRO'),
  iqroGraduatedAt: timestamp("iqro_graduated_at"),
  photoUrl: text("photo_url"),
  teacherNote: text("teacher_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id_attendance").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  date: date("date").defaultNow(),
  status: varchar("status", { length: 10 }).notNull(),
  session: varchar("session", { length: 10, enum: ['PAGI', 'SIANG', 'SORE'] }).notNull().default('PAGI'),
  time: time("time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== TRANSACTION TABLES ====================

export const learningRecords = pgTable("learning_records", {
  id: serial("id_learning_records").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  date: date("date").defaultNow(),
  type: varchar("type", { length: 10 }).notNull(),
  levelOrSurah: varchar("level_or_surah", { length: 50 }).notNull(),
  startPoint: varchar("start_point", { length: 20 }).notNull(),
  endPoint: varchar("end_point", { length: 20 }).notNull(),
  quality: integer("quality").notNull(), // nilai 1-10
  readingStatus: varchar("reading_status", { length: 20, enum: ['LANCAR', 'MENGULANG'] }).notNull().default('LANCAR'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memorizationRecords = pgTable("memorization_records", {
  id: serial("id_memorization_records").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  date: date("date").defaultNow(),
  surahId: integer("surah_id")
    .notNull()
    .references(() => masterSurahs.id),
  verseStart: integer("verse_start").notNull(),
  verseEnd: integer("verse_end").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  quality: integer("quality").notNull(), // nilai 1-10
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const worshipRecords = pgTable("worship_records", {
  id: serial("id_worship_records").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  teacherId: integer("teacher_id").references(
    () => users.id,
  ), // null jika recordedBy = PARENT
  date: date("date").defaultNow(),
  type: varchar("type", { length: 20 }).notNull(),
  dailyPrayerId: integer("daily_prayer_id").references(
    () => masterDailyPrayers.id,
  ),
  prayerReadingId: integer("prayer_reading_id").references(
    () => masterPrayerReadings.id,
  ),
  isCompleted: boolean("is_completed").default(false),
  quality: integer("quality"), // nilai 1-10 (nullable: tipe SALAT_FARDU tidak memakai nilai)
  prayerName: varchar("prayer_name", { length: 50 }),
  recordedBy: varchar("recorded_by", { length: 20, enum: ['TEACHER', 'PARENT'] }).notNull().default('TEACHER'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityPosts = pgTable("activity_posts", {
  id: serial("id_activity_posts").primaryKey(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  activityDate: date("activity_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityImages = pgTable("activity_images", {
  id: serial("id_activity_images").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => activityPosts.id),
  imageUrl: text("image_url").notNull(),
  caption: varchar("caption", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

