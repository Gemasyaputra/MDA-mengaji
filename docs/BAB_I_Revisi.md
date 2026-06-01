# BAB I
# PENDAHULUAN

## 1.1 Latar Belakang

Lembaga pendidikan non-formal berbasis keagamaan, seperti Madrasah Diniyah Awaliyah (MDA), memiliki peran strategis dalam membentuk karakter dan kemampuan spiritual anak-anak sejak usia dini. MDA Masjid Nurul Huda yang berlokasi di Simpang Piai, Kelurahan Cupak Tangah, Kecamatan Pauh, Kota Padang, merupakan salah satu lembaga pendidikan non-formal yang memiliki peran penting dalam menanamkan nilai-nilai Al-Qur'an kepada santri di lingkungan sekitarnya [1].

Seiring dengan bertambahnya jumlah santri yang mendaftar setiap tahunnya, pengelolaan administrasi dan akademik di MDA ini menghadapi tantangan yang semakin kompleks. Saat ini, seluruh proses pencatatan data mulai dari pendaftaran santri baru, presensi kehadiran, hingga penilaian setoran hafalan masih dilakukan secara manual menggunakan buku tulis dan kartu prestasi fisik.

Metode pencatatan konvensional ini memiliki beberapa kelemahan. Pertama, risiko kehilangan data sangat tinggi apabila buku prestasi santri rusak atau hilang, yang mengakibatkan hilangnya rekam jejak sejarah pembelajaran santri. Kedua, proses rekapitulasi nilai untuk pembuatan rapor memakan waktu lama dan rentan terjadi kesalahan manusia. Ketiga, dan yang paling krusial, adalah kurangnya transparansi informasi kepada orang tua. Wali santri sering kali tidak mengetahui secara *real-time* apakah anaknya benar-benar hadir mengaji atau sampai sejauh mana progres hafalan anaknya [2].

Manajemen Sistem Informasi Pendidikan (MSIP) merupakan elemen fundamental dalam modernisasi tata kelola lembaga pendidikan. Sistem ini berperan strategis dalam mendukung pengelolaan proses pendidikan yang kompleks, mulai dari manajemen data peserta didik hingga fasilitasi komunikasi antara guru dan orang tua. Meski menawarkan banyak manfaat, implementasinya sering terkendala keterbatasan sumber daya dan resistensi terhadap perubahan [2].

Sistem pemantauan akademik berbasis web memungkinkan pengelolaan data presensi dan penilaian secara terpusat dengan aksesibilitas tinggi tanpa perlu instalasi aplikasi. Penyajian data melalui *dashboard* visual berupa grafik kehadiran dan progres belajar terbukti meningkatkan transparansi antara lembaga dan orang tua, sekaligus mengurangi beban administrasi pengajar secara signifikan [3].

Untuk mengatasi kendala pencatatan manual tersebut, diperlukan sebuah sistem pemantauan akademik digital yang terpusat. Sistem ini dirancang secara khusus (*single-tenant*) untuk kebutuhan internal MDA Masjid Nurul Huda. Fitur utama yang dikembangkan mencakup digitalisasi presensi harian, modul input setoran tilawah Iqro maupun Al-Qur'an, modul setoran hafalan doa harian dan bacaan sholat bagi pengajar, modul kabar kegiatan dengan dokumentasi foto, serta sebuah portal pemantauan khusus bagi orang tua untuk memantau grafik kehadiran dan progres hafalan anak secara *real-time*.

Pengembangan sistem ini memanfaatkan teknologi Next.js sebagai kerangka kerja *full-stack* yang mampu menangani antarmuka pengguna sekaligus logika *backend* secara efisien dalam satu wadah. Penerapan *Server-Side Rendering* (SSR) pada Next.js terbukti meningkatkan performa dan skalabilitas aplikasi web secara signifikan [4]. Untuk pengelolaan basis data, sistem ini mengimplementasikan NeonDB, sebuah basis data PostgreSQL berbasis *serverless*. Pendekatan *serverless* dipilih karena efisien dari segi biaya, skalabel, dan tidak memerlukan pemeliharaan server fisik yang rumit, sehingga sesuai diterapkan pada skala lembaga pendidikan seperti MDA Masjid Nurul Huda [5]. Otentikasi pengguna diimplementasikan melalui *Single Sign-On* (SSO) Google OAuth 2.0 sehingga akses sistem terjamin keamanannya tanpa membebani pengguna mengingat kata sandi terpisah.

Berdasarkan kondisi tersebut, diajukan judul Tugas Akhir "Perancangan dan Implementasi Sistem Pemantauan Akademik dan Hafalan Santri Berbasis Web Menggunakan Next.js dan Database Serverless NeonDB pada MDA Masjid Nurul Huda". Sistem ini diharapkan dapat menjadi solusi digital yang memudahkan ustadz dalam mencatat nilai dan memberikan ketenangan pikiran bagi orang tua melalui fitur pemantauan yang transparan.

## 1.2 Rumusan Masalah

Berdasarkan latar belakang yang telah diuraikan, maka rumusan masalah dalam penelitian ini adalah:

a. Bagaimana merancang dan membangun fitur pencatatan akademik (meliputi presensi harian, setoran hafalan doa harian dan bacaan sholat, serta setoran tilawah Iqro/Al-Qur'an) yang responsif dan mudah digunakan oleh ustadz/ustadzah menggunakan *framework* Next.js?

b. Bagaimana mengembangkan Portal Orang Tua (*dashboard monitoring*) yang mampu menyajikan visualisasi data berupa grafik kehadiran, persentase progres hafalan, dan riwayat aktivitas santri secara *real-time* tanpa memerlukan proses *login*?

c. Bagaimana mengimplementasikan arsitektur basis data *serverless* menggunakan NeonDB (PostgreSQL) yang terintegrasi dengan Next.js untuk menyimpan dan mengelola seluruh riwayat data akademik MDA secara terpusat dan efisien?

## 1.3 Tujuan

Penelitian Tugas Akhir ini bertujuan untuk:

a. Membangun Modul Operasional Guru: menghasilkan fitur presensi dan formulir pencatatan setoran (hafalan doa, bacaan sholat, dan tilawah) berbasis web yang terdigitalisasi, sehingga ustadz/ustadzah dapat menginput data secara langsung melalui *smartphone* tanpa bergantung pada buku fisik.

b. Mewujudkan Transparansi Akademik: menyediakan portal pemantauan khusus wali santri yang menampilkan statistik kehadiran enam bulan terakhir, progres level pembelajaran, dan histori hafalan anak guna memfasilitasi keterbukaan informasi antara pihak MDA dan orang tua.

c. Mengimplementasikan Basis Data *Serverless*: menerapkan NeonDB sebagai pusat penyimpanan data yang terhubung langsung dengan Next.js dalam lingkup *single-tenant*, sehingga risiko kehilangan data dapat dihindari dan pemeliharaan server menjadi lebih ringkas.

## 1.4 Manfaat

a. Manfaat Teoritis

Penelitian ini diharapkan dapat memperkaya wawasan di bidang teknologi informasi, khususnya terkait pengembangan sistem pemantauan akademik berbasis web yang memanfaatkan teknologi *full-stack* modern (Next.js) dan basis data *serverless* (NeonDB). Selain itu, hasil penelitian ini dapat menjadi referensi bagi penelitian selanjutnya dalam pengembangan sistem informasi pendidikan non-formal serupa.

b. Manfaat Praktis

(1) Bagi Pengurus dan Ustadz/Ustadzah MDA

Mempermudah pencatatan presensi harian, input setoran hafalan doa, bacaan sholat, dan tilawah, serta pengelolaan data santri secara digital tanpa bergantung pada buku fisik.

(2) Bagi Wali Santri

Memberikan akses *real-time* untuk memantau grafik kehadiran dan progres hafalan anak melalui portal khusus orang tua, sehingga transparansi informasi antara MDA dan orang tua dapat terwujud.

(3) Bagi MDA Masjid Nurul Huda

Meningkatkan efisiensi operasional administrasi akademik secara keseluruhan, mengurangi risiko kehilangan data, dan menjadi langkah awal transformasi digital lembaga pendidikan non-formal berbasis masjid.

## 1.5 Batasan Masalah

Agar penyusunan Tugas Akhir ini lebih terarah dan fokus, ditetapkan batasan masalah sebagai berikut:

a. Objek Penelitian: sistem diimplementasikan khusus untuk studi kasus di MDA Masjid Nurul Huda Simpang Piai, Kelurahan Cupak Tangah, Kecamatan Pauh, Kota Padang. Sistem bersifat *single-tenant* dan tidak dirancang untuk melayani lebih dari satu lembaga.

b. Pengguna Sistem (Aktor): sistem melibatkan tiga peran pengguna, yaitu (1) Administrator MDA yang mengelola data induk lembaga (bank materi hafalan, data guru, data santri, dan pembagian kelompok belajar); (2) Guru (Ustadz/Ustadzah) yang melakukan input presensi, pencatatan setoran hafalan doa dan bacaan sholat, serta setoran tilawah Iqro/Al-Qur'an; serta (3) Wali Santri yang mengakses portal pemantauan (*view-only*) untuk memantau grafik kehadiran dan progres hafalan anak tanpa perlu *login*.

c. Lingkup Teknologi: *framework* yang digunakan adalah Next.js sebagai *full-stack framework*; basis data menggunakan NeonDB (*Serverless* PostgreSQL); pengelolaan skema basis data dan migrasi menggunakan Drizzle ORM, sedangkan operasi CRUD pada API menggunakan *raw SQL* terparametrisasi; otentikasi menggunakan NextAuth dengan penyedia Google OAuth 2.0; penyimpanan berkas (foto kegiatan) menggunakan Vercel Blob; dan tampilan antarmuka menggunakan Tailwind CSS.

d. Fokus Fitur: modul utama dibatasi pada presensi kehadiran, pencatatan setoran (doa harian, bacaan sholat, dan tilawah), bank materi hafalan, kabar kegiatan, dan dasbor pemantauan orang tua. Sistem tidak mencakup fitur manajemen keuangan lembaga, penggajian guru, ataupun pembayaran SPP santri.

e. Batasan Platform: sistem dibangun berbasis web dengan pendekatan *Mobile-First Design* agar optimal diakses melalui *smartphone* guru dan orang tua, serta tetap responsif pada perangkat *desktop*. Sistem tidak diwujudkan dalam bentuk aplikasi *native* Android atau iOS.

## 1.6 Metodologi

Metode yang digunakan pada penelitian Tugas Akhir ini adalah:

a. Jenis Data dan Pengumpulan Data

(1) Wawancara

Dilakukan wawancara kepada pengurus MDA Masjid Nurul Huda untuk memahami alur pencatatan manual yang berjalan saat ini, meliputi proses presensi harian, pencatatan setoran hafalan, dan kebutuhan informasi orang tua.

(2) Observasi

Dilakukan secara langsung di MDA Masjid Nurul Huda dengan mengumpulkan data tentang jumlah santri, struktur kelompok belajar, jenis hafalan yang diajarkan, dan mekanisme pelaporan kepada orang tua.

(3) Studi Literatur

Dikumpulkan referensi berupa jurnal ilmiah, dokumentasi teknis, dan buku yang berkaitan dengan sistem informasi pendidikan, teknologi Next.js, NeonDB, Drizzle ORM, Tailwind CSS, dan metode pengembangan perangkat lunak *Waterfall*.

b. Pengembangan Sistem

Metode pengembangan sistem yang digunakan pada penelitian ini adalah model *Waterfall*. Model *Waterfall* adalah metodologi pengembangan perangkat lunak sekuensial di mana setiap fase diselesaikan sebelum berlanjut ke fase berikutnya. Model ini dipilih karena kebutuhan sistem MDA Masjid Nurul Huda sudah terdefinisi jelas sejak awal melalui observasi langsung, sehingga pendekatan terstruktur ini menjamin setiap tahap pengembangan berjalan sistematis dan terdokumentasi [6].

(1) *Requirement* (Analisis Kebutuhan)

Observasi langsung dan wawancara dengan pengurus MDA Masjid Nurul Huda dilakukan untuk memahami alur pencatatan manual yang berjalan saat ini. Hasilnya didokumentasikan sebagai spesifikasi kebutuhan perangkat lunak yang menjadi acuan seluruh tahap pengembangan.

(2) *Design* (Perancangan Sistem)

Dirancang skema basis data di NeonDB menggunakan Drizzle ORM, arsitektur *full-stack* Next.js, serta desain antarmuka berbasis *Mobile-First* menggunakan Tailwind CSS. Pemodelan sistem dilakukan menggunakan UML (*Use Case Diagram*, *Activity Diagram*, *Class Diagram*, *Sequence Diagram*) dan ERD.

(3) *Implementation* (Coding)

Dibangun seluruh API *Routes* di Next.js untuk operasi presensi, setoran hafalan doa, bacaan sholat, setoran tilawah, kabar kegiatan, dan pengambilan data *dashboard*. Kueri ke NeonDB dieksekusi menggunakan *raw SQL* terparametrisasi dengan skema yang dikelola melalui Drizzle ORM. *Frontend* dibangun menggunakan Next.js dan Tailwind CSS dengan pendekatan *Mobile-First*.

(4) *Testing* (Pengujian)

Pengujian menggunakan dua metode: *Black Box Testing* untuk memvalidasi fungsionalitas setiap fitur, dan *User Acceptance Testing* (UAT) yang dilakukan langsung oleh ustadz dan wali santri MDA sebagai pengguna nyata [7].

(5) *Operation & Maintenance*

*Deployment* aplikasi Next.js ke platform Vercel dan konfigurasi NeonDB sebagai basis data produksi, diikuti pelatihan penggunaan sistem kepada pengurus dan ustadz MDA Masjid Nurul Huda.
