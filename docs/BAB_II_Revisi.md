# BAB II
# LANDASAN TEORI

## 2.1 Kajian Pustaka

Sistem Pemantauan Akademik dan Hafalan Santri pada MDA Masjid Nurul Huda dikembangkan untuk mendigitalisasi pencatatan presensi dan setoran hafalan santri secara terpusat. Berikut merupakan kajian penelitian serupa yang dijadikan rujukan dalam pembangunan sistem ini sebagaimana disajikan pada Tabel 2.1.

**Tabel 2.1 Kajian Pustaka**

| No | Judul Penelitian | Metode/Teknologi | Hasil | Perbedaan dengan Penelitian Ini |
|---|---|---|---|---|
| 1 | Sistem Informasi dalam Manajemen Pendidikan (Ardiansyah et al., 2024) [2] | Studi literatur manajemen sistem informasi pendidikan | Mengidentifikasi peran strategis MSIP dalam mendukung pengelolaan proses pendidikan dan komunikasi antara guru dan orang tua | Penelitian ini berfokus pada lembaga non-formal (MDA) dengan implementasi konkret menggunakan Next.js dan NeonDB, bukan studi literatur |
| 2 | Implementasi Sistem Informasi Akademik Berbasis Web untuk Meningkatkan Efisiensi Administrasi Madrasah (Prasetyo & Wahyuni, 2023) [3] | Web-based, PHP/MySQL | Sistem mampu meningkatkan efisiensi administrasi madrasah dan transparansi data akademik kepada orang tua | Penelitian ini menggunakan Next.js *full-stack* dengan NeonDB *serverless* dan menambahkan fitur pemantauan hafalan *real-time* serta portal orang tua tanpa *login* yang tidak ada pada penelitian tersebut |
| 3 | E-commerce Website Using Next.js (Prabakar, 2025) [4] | Next.js SSR, React | Penerapan SSR pada Next.js terbukti meningkatkan performa dan skalabilitas aplikasi web secara signifikan | Penelitian ini mengaplikasikan Next.js untuk domain pendidikan non-formal dengan integrasi NeonDB, bukan untuk *e-commerce* |
| 4 | Serverless Applications: Why, When, and How? (Eismann et al., 2021) [5] | *Serverless architecture*, *cloud computing* | Arsitektur *serverless* efisien dari segi biaya dan tidak memerlukan pemeliharaan server fisik yang rumit | Penelitian ini menerapkan konsep *serverless* secara konkret melalui NeonDB pada konteks sistem akademik MDA |

## 2.2 Konsep Sistem yang Dibuat

Sistem Pemantauan Akademik dan Hafalan Santri ini dirancang sebagai aplikasi web *full-stack* berbasis *single-tenant* yang dikhususkan untuk operasional MDA Masjid Nurul Huda. Secara konseptual, sistem ini terdiri dari tiga lapisan utama yang saling terintegrasi: lapisan antarmuka pengguna (*front-end*), lapisan logika bisnis (*back-end* API), dan lapisan penyimpanan data (*database*).

Lapisan *front-end* dibangun menggunakan Next.js dengan pendekatan *Mobile-First Design* agar optimal diakses melalui *smartphone*. Antarmuka diimplementasikan sebagai *Client Components* yang berkomunikasi dengan *back-end* melalui protokol HTTP. Lapisan *back-end* diimplementasikan melalui Next.js API *Routes* yang menangani seluruh logika bisnis, mulai dari otentikasi pengguna melalui NextAuth hingga pemrosesan data presensi dan hafalan. Lapisan penyimpanan data menggunakan NeonDB sebagai basis data PostgreSQL berbasis *serverless*, di mana operasi kueri dijalankan menggunakan *raw SQL* terparametrisasi dan skema basis data dikelola menggunakan Drizzle ORM. Berkas pendukung berupa foto kegiatan disimpan secara terpisah di Vercel Blob.

Sistem melibatkan tiga peran pengguna dengan hak akses yang berbeda. Administrator MDA memiliki akses penuh untuk mengelola data induk lembaga, mencakup data guru, data santri, kelompok belajar, dan bank materi hafalan. Guru (Ustadz/Ustadzah) dapat melakukan input presensi harian dan mencatat setoran hafalan santri (doa harian, bacaan sholat, serta tilawah Iqro/Al-Qur'an). Wali Santri mendapatkan akses portal pemantauan (*view-only*) untuk memantau progres akademik anak secara *real-time* melalui visualisasi grafik dan statistik tanpa perlu *login*, di mana keamanan akses bersandar pada *slug* unik yang dibagikan secara langsung kepada masing-masing wali.

## 2.3 Unsur-unsur dalam Perancangan Aplikasi

Perancangan Sistem Pemantauan Akademik dan Hafalan Santri ini didukung oleh beberapa teknologi dan konsep yang menjadi landasan pembangunannya, sebagai berikut.

### 2.3.1 Manajemen Sistem Informasi Pendidikan

Manajemen Sistem Informasi Pendidikan (MSIP) merupakan elemen fundamental dalam modernisasi tata kelola lembaga pendidikan. Sistem ini berperan strategis dalam mendukung pengelolaan proses pendidikan yang kompleks, mulai dari manajemen data peserta didik hingga fasilitasi komunikasi antara guru dan orang tua. Meski menawarkan banyak manfaat, implementasinya sering terkendala keterbatasan sumber daya dan resistensi terhadap perubahan, sehingga dibutuhkan perencanaan yang matang [2].

Dalam konteks MDA Masjid Nurul Huda, penerapan MSIP bertujuan mengalihkan proses administrasi manual yang selama ini menggunakan buku fisik menjadi sistem digital yang terpusat. Hal ini sejalan dengan temuan Ardiansyah et al. (2024) bahwa digitalisasi administrasi pendidikan secara signifikan mengurangi beban kerja pengajar dan meningkatkan akurasi data [2].

### 2.3.2 Next.js (Full-Stack React Framework)

Next.js adalah kerangka kerja *open-source* berbasis React yang memungkinkan pembangunan aplikasi web *full-stack* dalam satu basis kode. Fitur *Server-Side Rendering* (SSR), *Static Site Generation* (SSG), dan API *Routes* menghilangkan kebutuhan akan server *backend* terpisah, sehingga antarmuka pengguna dan logika bisnis dapat dikelola bersama. Penerapan SSR pada Next.js secara signifikan meningkatkan performa dan skalabilitas aplikasi web [4].

*App Router* yang diperkenalkan sejak Next.js 13 menghadirkan paradigma baru dalam pengelolaan rute dan komponen. Pada implementasi sistem ini, *App Router* digunakan untuk mengorganisasi halaman dan API *Routes* secara konvensi berbasis *folder*. Komponen halaman ditandai sebagai *Client Components* (menggunakan direktif `'use client'`) untuk menangani interaktivitas dinamis seperti formulir input nilai, presensi, dan pengelolaan data, sedangkan API *Routes* yang berjalan di sisi server menangani seluruh kueri ke basis data [8].

### 2.3.3 NeonDB: Database Serverless PostgreSQL

NeonDB adalah layanan PostgreSQL *serverless* yang menggunakan arsitektur pemisahan komputasi dan penyimpanan (*compute-storage separation*). Keunggulannya meliputi skalabilitas otomatis, model biaya berbasis penggunaan, dan kompatibilitas penuh dengan ekosistem Next.js. NeonDB mendukung properti ACID penuh untuk menjamin integritas data transaksi pencatatan akademik [5].

Aspek penting yang perlu diperhatikan dalam penggunaan NeonDB adalah fenomena *cold start*, yaitu kondisi ketika *compute endpoint* NeonDB yang sedang dalam kondisi *scale-to-zero* harus dihidupkan kembali untuk melayani permintaan koneksi pertama. Durasi *cold start* berkisar antara 100 milidetik hingga beberapa detik. Strategi mitigasi yang diterapkan meliputi *connection pooling* via PgBouncer bawaan NeonDB dan konfigurasi *suspend timeout* yang lebih panjang [9].

### 2.3.4 Drizzle ORM

Drizzle ORM adalah *Object-Relational Mapping* (ORM) ringan yang dirancang untuk ekosistem TypeScript dan Node.js dengan pendekatan *type-safe*. Berbeda dari ORM konvensional, Drizzle mengutamakan transparansi kueri karena menghasilkan *raw SQL* yang dapat diprediksi dan dioptimalkan secara langsung. Dalam proyek ini, Drizzle ORM digunakan untuk mendefinisikan skema tabel pada berkas TypeScript dan menjalankan migrasi basis data di NeonDB, sementara operasi CRUD aktual di dalam API *Routes* dieksekusi menggunakan *raw SQL* untuk fleksibilitas dan performa yang optimal [10].

Dengan arsitektur ini, Drizzle ORM berfungsi sebagai *schema manager* yang menjamin konsistensi struktur tabel antara lingkungan pengembangan dan produksi, sedangkan *raw SQL* memungkinkan penulisan kueri yang presisi dan efisien, khususnya untuk operasi agregasi data seperti perhitungan persentase kehadiran enam bulan terakhir dan progres hafalan santri.

### 2.3.5 Raw SQL Query

*Raw SQL* (*Structured Query Language*) adalah pendekatan pemrograman basis data di mana pengembang menulis pernyataan SQL secara langsung tanpa lapisan abstraksi ORM. Dalam konteks sistem ini, *raw SQL* digunakan di dalam Next.js API *Routes* untuk mengeksekusi operasi data seperti INSERT (menambah data presensi/setoran), SELECT dengan JOIN untuk mengambil riwayat lengkap santri, dan agregasi statistik untuk *dashboard*. Pendekatan ini memberikan kontrol penuh atas performa kueri dan kemudahan dalam melakukan optimasi, terutama untuk kueri-kueri yang bersifat kompleks. Untuk mencegah celah keamanan *SQL Injection*, seluruh kueri yang melibatkan data pengguna ditulis menggunakan *parameterized query* dengan plasholder bernomor (`$1`, `$2`, dan seterusnya) [10].

### 2.3.6 Tailwind CSS

Tailwind CSS adalah *framework* CSS *utility-first* yang memungkinkan pembangunan antarmuka responsif langsung melalui kelas utilitas dalam *markup* HTML. Pendekatannya yang *Mobile-First* sangat sesuai untuk kebutuhan akses sistem melalui *smartphone* guru dan orang tua santri. Tailwind CSS berpadu baik dengan Next.js karena mendukung *purging* otomatis CSS yang tidak terpakai, menghasilkan *bundle* yang ringan [11].

### 2.3.7 NextAuth dan Google OAuth 2.0

NextAuth (Auth.js) adalah pustaka otentikasi *open-source* untuk Next.js yang mendukung berbagai penyedia identitas, termasuk Google OAuth 2.0. Pada sistem ini, NextAuth digunakan dengan strategi *JSON Web Token* (JWT) untuk mengelola sesi pengguna setelah otentikasi berhasil melalui akun Google. Setiap permintaan masuk akan divalidasi terhadap basis data: hanya alamat email yang sudah terdaftar di tabel `users` dan berstatus terverifikasi yang diizinkan masuk. Pendekatan ini menghilangkan kebutuhan pengelolaan kata sandi mandiri sekaligus meningkatkan keamanan karena mengandalkan infrastruktur otentikasi Google [12].

### 2.3.8 Vercel Blob Storage

Vercel Blob adalah layanan penyimpanan berkas berbasis *cloud* yang terintegrasi langsung dengan ekosistem Vercel. Pada sistem ini, Vercel Blob digunakan sebagai tempat penyimpanan foto kegiatan yang diunggah pada modul Kabar. Setiap berkas yang berhasil diunggah menghasilkan URL publik yang stabil sehingga dapat ditampilkan kembali di antarmuka tanpa membebani basis data dengan data biner.

### 2.3.9 Arsitektur Sistem dan Alur Request-Response API

Sistem ini dirancang dengan arsitektur *full-stack* *single-tenant* berbasis Next.js. Lapisan *client* terdiri dari tiga antarmuka berbeda sesuai peran pengguna (Administrator, Guru, Wali Santri) yang masing-masing berkomunikasi dengan API *Routes* Next.js melalui protokol HTTPS. API *Routes* bertindak sebagai *backend* yang memvalidasi *request*, mengeksekusi *raw SQL query* ke NeonDB, lalu mengembalikan *response* JSON ke *client*.

Alur kerja API mengikuti pola *request-response* RESTful. Sebagai contoh, saat ustadz menyimpan data setoran hafalan: *browser* mengirim HTTP POST ke `/api/learning-records` beserta *payload* data; API *Route* memvalidasi *input* dan sesi pengguna; sistem mengeksekusi *raw SQL* INSERT terparametrisasi langsung ke NeonDB; basis data mengembalikan *record* yang baru dibuat; dan API *Route* merespons dengan JSON `{ success: true, data }` yang ditampilkan sebagai notifikasi *toast* di antarmuka ustadz.

### 2.3.10 Model Pengembangan Waterfall

Model *Waterfall* adalah metodologi pengembangan perangkat lunak sekuensial di mana setiap fase diselesaikan sebelum berlanjut ke fase berikutnya. Fase-fase tersebut mencakup: (1) Analisis Kebutuhan; (2) Perancangan Sistem; (3) Implementasi (*Coding*); (4) Pengujian; dan (5) Pemeliharaan. Model ini dipilih karena kebutuhan sistem MDA Masjid Nurul Huda sudah terdefinisi jelas sejak awal melalui observasi langsung, sehingga pendekatan terstruktur ini menjamin setiap tahap pengembangan berjalan sistematis dan terdokumentasi [6].

### 2.3.11 User Acceptance Testing (UAT)

*User Acceptance Testing* (UAT) adalah tahap pengujian akhir di mana sistem diuji langsung oleh pengguna sesungguhnya — dalam hal ini ustadz dan wali santri MDA — untuk memvalidasi bahwa sistem memenuhi kebutuhan dan harapan mereka dalam kondisi penggunaan nyata. UAT dilakukan dengan skenario penggunaan yang mewakili aktivitas harian, seperti sesi input nilai setelah mengajar dan pengecekan progres hafalan oleh orang tua. Hasil UAT menjadi dasar penerimaan formal sistem oleh pihak MDA Masjid Nurul Huda [7].

## 2.4 Pemodelan Sistem

### 2.4.1 Flowchart

*Flowchart* atau diagram alir merupakan representasi grafis dari alur proses atau algoritma menggunakan simbol-simbol standar. Dalam konteks pengembangan sistem informasi, *flowchart* digunakan untuk menggambarkan alur kerja sistem yang sedang berjalan maupun sistem yang akan dibangun, sehingga memudahkan analisis dan identifikasi titik-titik yang memerlukan perbaikan.

### 2.4.2 UML (Unified Modelling Language)

UML (*Unified Modelling Language*) adalah bahasa pemodelan standar yang digunakan untuk merancang, memvisualisasikan, dan mendokumentasikan arsitektur sistem perangkat lunak. UML menyediakan berbagai jenis diagram yang saling melengkapi untuk menggambarkan aspek yang berbeda dari sebuah sistem.

#### 2.4.2.1 Use Case Diagram

*Use Case Diagram* menggambarkan interaksi antara aktor (pengguna sistem) dengan fungsionalitas yang disediakan oleh sistem. Diagram ini membantu mendefinisikan ruang lingkup sistem dan menunjukkan siapa yang dapat menggunakan fitur apa. Dalam sistem ini, terdapat tiga aktor utama: Administrator, Guru (Ustadz/Ustadzah), dan Wali Santri.

#### 2.4.2.2 Activity Diagram

*Activity Diagram* menggambarkan alur kerja atau aktivitas dalam suatu proses bisnis dari awal hingga akhir. Diagram ini berguna untuk menampilkan logika alur kerja yang kompleks dan proses paralel, seperti alur input presensi santri secara *bulk*, alur pencatatan setoran hafalan, serta alur orang tua memantau progres anak melalui portal.

#### 2.4.2.3 Class Diagram

*Class Diagram* menggambarkan struktur statis dari sistem dengan menampilkan kelas-kelas, atribut, operasi, serta hubungan antar kelas. Dalam pengembangan sistem berbasis Next.js dengan skema Drizzle ORM, *class diagram* merepresentasikan model-model data yang mendefinisikan struktur tabel di NeonDB.

#### 2.4.2.4 Sequence Diagram

*Sequence Diagram* menggambarkan interaksi antar objek dalam urutan waktu tertentu. Diagram ini sangat relevan untuk mengilustrasikan alur komunikasi antara komponen sistem, seperti alur antara antarmuka pengguna, API *Routes* Next.js, NextAuth, dan NeonDB dalam proses *login* maupun penyimpanan data setoran hafalan.

### 2.4.3 ERD (Entity Relationship Diagram)

*Entity Relationship Diagram* (ERD) adalah representasi visual dari entitas-entitas dalam basis data dan hubungan antar entitas tersebut. ERD digunakan sebagai acuan dalam merancang skema basis data yang akan diimplementasikan di NeonDB melalui Drizzle ORM. Entitas utama dalam sistem ini meliputi tiga kelompok besar: (1) entitas *master data* (`master_surahs`, `master_daily_prayers`, `master_prayer_readings`); (2) entitas *core* (`users`, `study_groups`, `students`, `attendance`); dan (3) entitas transaksi (`learning_records`, `worship_records`, `activity_posts`, `activity_images`, `activity_comments`, `notifications`). Seluruh entitas tersebut saling berelasi satu sama lain melalui *foreign key* untuk menjamin integritas referensial data.
