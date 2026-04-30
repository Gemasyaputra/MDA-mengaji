-- ==========================================
-- SEED DATA (DATA DUMMY)
-- ==========================================

-- A. SEED MASTER DATA SURAH (114 Surah Lengkap dengan Juz)
INSERT INTO master_surahs (id, name_latin, name_arabic, total_verses, revelation_type, juz) VALUES
(1, 'Al-Fatiha', 'الفاتحة', 7, 'Makkiyah', '1'),
(2, 'Al-Baqara', 'البقرة', 286, 'Madaniyah', '1, 2, 3'),
(3, 'Aal-Imran', 'آل عمران', 200, 'Madaniyah', '3, 4'),
(4, 'An-Nisaa''', 'النساء', 176, 'Madaniyah', '4, 5, 6'),
(5, 'Al-Ma''ida', 'المائدة', 120, 'Madaniyah', '6, 7'),
(6, 'Al-An''am', 'الأنعام', 165, 'Makkiyah', '7, 8'),
(7, 'Al-A''raf', 'الأعراف', 206, 'Makkiyah', '8, 9'),
(8, 'Al-Anfal', 'الأنفال', 75, 'Madaniyah', '9, 10'),
(9, 'Al-Tawba', 'التوبة', 129, 'Madaniyah', '10, 11'),
(10, 'Yunus', 'يونس', 109, 'Makkiyah', '11'),
(11, 'Hud', 'هود', 123, 'Makkiyah', '11, 12'),
(12, 'Yusuf', 'يوسف', 111, 'Makkiyah', '12, 13'),
(13, 'Ar-Ra''d', 'الرعد', 43, 'Madaniyah', '13'),
(14, 'Ibrahim', 'إبراهيم', 52, 'Makkiyah', '13'),
(15, 'Al-Hijr', 'الحجر', 99, 'Makkiyah', '14'),
(16, 'An-Nahl', 'النحل', 128, 'Makkiyah', '14'),
(17, 'Al-Israa', 'الإسراء', 111, 'Makkiyah', '15'),
(18, 'Al-Kahf', 'الكهف', 110, 'Makkiyah', '15, 16'),
(19, 'Maryam', 'مريم', 98, 'Makkiyah', '16'),
(20, 'Ta-Ha', 'طه', 135, 'Makkiyah', '16'),
(21, 'Al-Anbiya', 'الأنبياء', 112, 'Makkiyah', '17'),
(22, 'Al-Hajj', 'الحج', 78, 'Madaniyah', '17'),
(23, 'Al-Muminun', 'المؤمنون', 118, 'Makkiyah', '18'),
(24, 'An-Nur', 'النور', 64, 'Madaniyah', '18'),
(25, 'Al-Furqan', 'الفرقان', 77, 'Makkiyah', '18, 19'),
(26, 'Ash-Shuara', 'الشعراء', 227, 'Makkiyah', '19'),
(27, 'An-Naml', 'النمل', 93, 'Makkiyah', '19, 20'),
(28, 'Al-Qasas', 'القصص', 88, 'Makkiyah', '20'),
(29, 'Al-Ankabut', 'العنكبوت', 69, 'Makkiyah', '20, 21'),
(30, 'Ar-Rum', 'الروم', 60, 'Makkiyah', '21'),
(31, 'Luqman', 'لقمان', 34, 'Makkiyah', '21'),
(32, 'As-Sajdah', 'السجدة', 30, 'Makkiyah', '21'),
(33, 'Al-Ahzab', 'الأحزاب', 73, 'Madaniyah', '21, 22'),
(34, 'Saba', 'سبأ', 54, 'Makkiyah', '22'),
(35, 'Fatir', 'فاطر', 45, 'Makkiyah', '22'),
(36, 'Yasin', 'يس', 83, 'Makkiyah', '22, 23'),
(37, 'As-Saffat', 'الصافات', 182, 'Makkiyah', '23'),
(38, 'Sad', 'ص', 88, 'Makkiyah', '23'),
(39, 'Az-Zumar', 'الزمر', 75, 'Makkiyah', '23, 24'),
(40, 'Ghafir', 'غافر', 85, 'Makkiyah', '24'),
(41, 'Fussilat', 'فصلت', 54, 'Makkiyah', '24, 25'),
(42, 'Ash-Shura', 'الشورى', 53, 'Makkiyah', '25'),
(43, 'Az-Zukhruf', 'الزخرف', 89, 'Makkiyah', '25'),
(44, 'Ad-Dukhan', 'الدخان', 59, 'Makkiyah', '25'),
(45, 'Al-Jathiya', 'الجاثية', 37, 'Makkiyah', '25'),
(46, 'Al-Ahqaf', 'الأحقاف', 35, 'Makkiyah', '26'),
(47, 'Muhammad', 'محمد', 38, 'Madaniyah', '26'),
(48, 'Al-Fath', 'الفتح', 29, 'Madaniyah', '26'),
(49, 'Al-Hujurat', 'الحجرات', 18, 'Madaniyah', '26'),
(50, 'Qaf', 'ق', 45, 'Makkiyah', '26'),
(51, 'Az-Zariyat', 'الذاريات', 60, 'Makkiyah', '26, 27'),
(52, 'At-Tur', 'الطور', 49, 'Makkiyah', '27'),
(53, 'An-Najm', 'النجم', 62, 'Makkiyah', '27'),
(54, 'Al-Qamar', 'القمر', 55, 'Makkiyah', '27'),
(55, 'Ar-Rahman', 'الرحمن', 78, 'Madaniyah', '27'),
(56, 'Al-Waqia', 'الواقعة', 96, 'Makkiyah', '27'),
(57, 'Al-Hadid', 'الحديد', 29, 'Madaniyah', '27'),
(58, 'Al-Mujadilah', 'المجادلة', 22, 'Madaniyah', '28'),
(59, 'Al-Hashr', 'الحشر', 24, 'Madaniyah', '28'),
(60, 'Al-Mumtahinah', 'الممتحنة', 13, 'Madaniyah', '28'),
(61, 'As-Saff', 'الصف', 14, 'Madaniyah', '28'),
(62, 'Al-Jumu''ah', 'الجمعة', 11, 'Madaniyah', '28'),
(63, 'Al-Munafiqun', 'المنافقون', 11, 'Madaniyah', '28'),
(64, 'At-Taghabun', 'التغابن', 18, 'Madaniyah', '28'),
(65, 'At-Talaq', 'الطلاق', 12, 'Madaniyah', '28'),
(66, 'At-Tahrim', 'التحريم', 12, 'Madaniyah', '28'),
(67, 'Al-Mulk', 'الملك', 30, 'Makkiyah', '29'),
(68, 'Al-Qalam', 'القلم', 52, 'Makkiyah', '29'),
(69, 'Al-Haqqah', 'الحاقة', 52, 'Makkiyah', '29'),
(70, 'Al-Ma''arij', 'المعارج', 44, 'Makkiyah', '29'),
(71, 'Nuh', 'نوح', 28, 'Makkiyah', '29'),
(72, 'Al-Jinn', 'الجن', 28, 'Makkiyah', '29'),
(73, 'Al-Muzzammil', 'المزمل', 20, 'Makkiyah', '29'),
(74, 'Al-Muddaththir', 'المدثر', 56, 'Makkiyah', '29'),
(75, 'Al-Qiyamah', 'القيامة', 40, 'Makkiyah', '29'),
(76, 'Al-Insan', 'الإنسان', 31, 'Madaniyah', '29'),
(77, 'Al-Mursalat', 'المرسلات', 50, 'Makkiyah', '29'),
(78, 'An-Naba', 'النبأ', 40, 'Makkiyah', '30'),
(79, 'An-Naziat', 'النازعات', 46, 'Makkiyah', '30'),
(80, 'Abasa', 'عبس', 42, 'Makkiyah', '30'),
(81, 'At-Takwir', 'التكوير', 29, 'Makkiyah', '30'),
(82, 'Al-Infitar', 'الإنفطار', 19, 'Makkiyah', '30'),
(83, 'Al-Mutaffifin', 'المطففين', 36, 'Makkiyah', '30'),
(84, 'Al-Inshiqaq', 'الإنشقاق', 25, 'Makkiyah', '30'),
(85, 'Al-Buruj', 'البروج', 22, 'Makkiyah', '30'),
(86, 'At-Tariq', 'الطارق', 17, 'Makkiyah', '30'),
(87, 'Al-Ala', 'الأعلى', 19, 'Makkiyah', '30'),
(88, 'Al-Ghashiyah', 'الغاشية', 26, 'Makkiyah', '30'),
(89, 'Al-Fajr', 'الفجر', 30, 'Makkiyah', '30'),
(90, 'Al-Balad', 'البلد', 20, 'Makkiyah', '30'),
(91, 'Ash-Shams', 'الشمس', 15, 'Makkiyah', '30'),
(92, 'Al-Lail', 'الليل', 21, 'Makkiyah', '30'),
(93, 'Ad-Duha', 'الضحى', 11, 'Makkiyah', '30'),
(94, 'Ash-Sharh', 'الشرح', 8, 'Makkiyah', '30'),
(95, 'At-Tin', 'التين', 8, 'Makkiyah', '30'),
(96, 'Al-Alaq', 'العلق', 19, 'Makkiyah', '30'),
(97, 'Al-Qadr', 'القدر', 5, 'Makkiyah', '30'),
(98, 'Al-Bayinah', 'البينة', 8, 'Madaniyah', '30'),
(99, 'Az-Zalzalah', 'الزلزلة', 8, 'Madaniyah', '30'),
(100, 'Al-Adiyat', 'العاديات', 11, 'Makkiyah', '30'),
(101, 'Al-Qariah', 'القارعة', 11, 'Makkiyah', '30'),
(102, 'Al-Takathur', 'التكاثر', 8, 'Makkiyah', '30'),
(103, 'Al-Asr', 'العصر', 3, 'Makkiyah', '30'),
(104, 'Al-Humazah', 'الهمزة', 9, 'Makkiyah', '30'),
(105, 'Al-Fil', 'الفيل', 5, 'Makkiyah', '30'),
(106, 'Quraish', 'قريش', 4, 'Makkiyah', '30'),
(107, 'Al-Ma''un', 'الماعون', 7, 'Makkiyah', '30'),
(108, 'Al-Kauthar', 'الكوثر', 3, 'Makkiyah', '30'),
(109, 'Al-Kafirun', 'الكافرون', 6, 'Makkiyah', '30'),
(110, 'An-Nasr', 'النصر', 3, 'Madaniyah', '30'),
(111, 'Al-Masad', 'المسد', 5, 'Makkiyah', '30'),
(112, 'Al-Ikhlas', 'الإخلاص', 4, 'Makkiyah', '30'),
(113, 'Al-Falaq', 'الفلق', 5, 'Makkiyah', '30'),
(114, 'An-Nas', 'الناس', 6, 'Makkiyah', '30')
ON CONFLICT (id) DO UPDATE SET
  name_latin = EXCLUDED.name_latin,
  name_arabic = EXCLUDED.name_arabic,
  total_verses = EXCLUDED.total_verses,
  revelation_type = EXCLUDED.revelation_type,
  juz = EXCLUDED.juz;


-- B. SEED MASTER DATA DOA HARIAN (Sampel 3 Doa)
INSERT INTO master_daily_prayers (title, category, arabic_text, translation) VALUES
('Doa Sebelum Makan', 'Adab Makan', 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ', 'Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan kepada kami'),
('Doa Sesudah Makan', 'Adab Makan', 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا', 'Segala puji bagi Allah yang telah memberi makan kami'),
('Doa Masuk Masjid', 'Adab Masjid', 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', 'Ya Allah, bukalah untukku pintu-pintu rahmat-Mu')
ON CONFLICT DO NOTHING;

-- C. SEED MASTER DATA BACAAN SHOLAT (Sampel 3 Bacaan)
INSERT INTO master_prayer_readings (step_order, title, category, arabic_text) VALUES
(1, 'Takbiratul Ihram', 'Rukun', 'الله أكبر'),
(2, 'Doa Iftitah', 'Sunnah', 'الله أكبر كبيرا والحمد لله كثيرا'),
(3, 'Surah Al-Fatihah', 'Rukun', 'بسم الله الرحمن الرحيم')
ON CONFLICT DO NOTHING;

-- D. SEED DATA MASJID & USERS
INSERT INTO mosques (name, slug, address, contact_phone) VALUES
('Masjid Al-Hikmah', 'al-hikmah-jkt', 'Jakarta Selatan', '021-123456'),
('Masjid Nurul Iman', 'nurul-iman-bdg', 'Bandung Kota', '022-234567')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (mosque_id, name, email, password_hash, phone, role) VALUES
(1, 'Admin Hikmah', 'admin@hikmah.com', 'pass123', '081-123456', 'admin'),
(1, 'Ustadz Ali', 'ali@hikmah.com', 'pass123', '081-123457', 'teacher'),
(2, 'Admin Nurul', 'admin@nurul.com', 'pass123', '082-234567', 'admin'),
(2, 'Ustadzah Dina', 'dina@nurul.com', 'pass123', '082-234568', 'teacher')
ON CONFLICT DO NOTHING;

-- E. SEED DATA SANTRI
INSERT INTO students (mosque_id, name, slug, parent_name, parent_phone, birth_date, gender, current_level) VALUES
(1, 'Ahmad Fauzi', 'ahmad-fauzi-123', 'Pak Ahmad', '0628123456', '2015-05-10', 'L', 'Iqro Jilid 4'),
(1, 'Budi Santoso', 'budi-santoso-456', 'Pak Budi', '0628123457', '2016-07-15', 'L', 'Iqro Jilid 3'),
(2, 'Siti Aminah', 'siti-aminah-789', 'Bu Aminah', '0628123458', '2014-03-20', 'P', 'Al-Quran Surah Al-Fatihah'),
(2, 'Rizky Billar', 'rizky-billar-999', 'Pak Rizky', '0628123459', '2017-11-08', 'L', 'Iqro Jilid 2')
ON CONFLICT (slug) DO NOTHING;

-- F. SEED TRANSAKSI HAFALAN
INSERT INTO memorization_records (student_id, teacher_id, surah_id, verse_start, verse_end, status, quality, date) VALUES
(1, 2, 1, 1, 7, 'MURAJAAH', 'LANCAR', CURRENT_DATE),
(3, 4, 5, 1, 6, 'ZIYADAH', 'KURANG', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- G. SEED TRANSAKSI IBADAH
INSERT INTO worship_records (student_id, teacher_id, type, daily_prayer_id, is_completed, quality, date) VALUES
(1, 2, 'DOA_HARIAN', 1, true, 'A', CURRENT_DATE),
(3, 4, 'DOA_HARIAN', 3, true, 'B', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- H. SEED DATA PRESENSI
INSERT INTO attendance (student_id, teacher_id, date, status, notes) VALUES
(1, 2, CURRENT_DATE, 'HADIR', 'Hadiri dengan baik'),
(2, 2, CURRENT_DATE, 'HADIR', ''),
(3, 4, CURRENT_DATE, 'HADIR', ''),
(4, 4, CURRENT_DATE, 'SAKIT', 'Sakit demam')
ON CONFLICT DO NOTHING;

-- I. SEED DATA LEARNING RECORDS
INSERT INTO learning_records (student_id, teacher_id, date, type, level_or_surah, start_point, end_point, quality, notes) VALUES
(1, 2, CURRENT_DATE, 'IQRO', 'Jilid 4', 'Hal 1', 'Hal 3', 'A', 'Lancar'),
(2, 2, CURRENT_DATE, 'IQRO', 'Jilid 3', 'Hal 5', 'Hal 6', 'B', 'Cukup lancar'),
(3, 4, CURRENT_DATE, 'QURAN', 'Al-Fatihah', 'Ayat 1', 'Ayat 7', 'A', 'Sangat lancar'),
(4, 4, CURRENT_DATE, 'IQRO', 'Jilid 2', 'Hal 1', 'Hal 2', 'C', 'Kurang lancar')
ON CONFLICT DO NOTHING;

-- J. SEED DATA ACTIVITY POSTS
INSERT INTO activity_posts (mosque_id, author_id, title, content, activity_date) VALUES
(1, 2, 'Acara Tarawih Rame-Rame', 'Alhamdulillah, acara tarawih kami dihadiri oleh lebih dari 100 jamaah. Suasana sangat khusyuk dan penuh berkah.', CURRENT_DATE),
(2, 4, 'Wisata Edukatif ke Masjid Raya', 'Anak-anak kami mengunjungi Masjid Raya untuk belajar sejarah dan arsitektur masjid.', CURRENT_DATE)
ON CONFLICT DO NOTHING;
