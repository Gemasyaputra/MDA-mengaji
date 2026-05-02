import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Smartphone, BookOpen, History, Clock, CheckCircle2, 
  ShieldCheck, Users, Database, Play, MessageCircle,
  ArrowRight, ChevronDown, Star, GraduationCap, 
  LayoutDashboard, FileText, Send, 
  Check, X, AlertTriangle, Activity, Newspaper, CalendarDays, ChevronRight, RefreshCw
} from 'lucide-react';

// --- CUSTOM HOOK FOR SCROLL ANIMATION ---
const useElementOnScreen = (options: IntersectionObserverInit) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target); // Hanya animasi sekali
      }
    }, options);
    
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef, options]);

  return [containerRef, isVisible] as const;
};

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale';
}

const AnimateOnScroll = ({ children, className = "", delay = 0, animation = "fade-up" }: AnimateOnScrollProps) => {
  const [ref, isVisible] = useElementOnScreen({
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  const getAnimationClasses = () => {
    if (!isVisible) {
      if (animation === "fade-up") return "opacity-0 translate-y-10";
      if (animation === "fade-left") return "opacity-0 translate-x-10";
      if (animation === "fade-right") return "opacity-0 -translate-x-10";
      if (animation === "scale") return "opacity-0 scale-95";
      return "opacity-0";
    }
    return "opacity-100 translate-y-0 translate-x-0 scale-100";
  };

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ease-out ${getAnimationClasses()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- MOCK UI COMPONENTS (Based on PDF) ---
const MockAppUI = () => (
  <div className="relative mx-auto w-full max-w-[300px] bg-white rounded-[2rem] border-8 border-slate-800 shadow-2xl overflow-hidden h-[500px] flex flex-col">
    {/* Status Bar */}
    <div className="bg-emerald-600 text-white h-12 flex items-center justify-between px-4 text-xs font-semibold">
      <span>10:23</span>
      <div className="flex space-x-1">
        <Activity size={14} />
      </div>
    </div>
    {/* App Header */}
    <div className="bg-emerald-600 p-4 text-white rounded-b-xl shadow-sm z-10">
      <h3 className="font-bold text-lg">Input Data</h3>
      <p className="text-emerald-100 text-xs">Kamis, 26 Feb 2026</p>
    </div>
    
    {/* App Content */}
    <div className="p-4 flex-1 bg-slate-50 flex flex-col gap-3 overflow-y-auto">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">GS</div>
        <div>
          <p className="font-bold text-sm text-slate-800">Gema Syaputra</p>
          <p className="text-xs text-slate-500">Kelompok 1</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">PILIH DOA / MATERI</p>
        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm text-slate-700 flex justify-between items-center">
          <span>Doa Sesudah Makan</span>
          <ChevronDown size={14} />
        </div>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1">
            <CheckCircle2 size={14} /> Lulus
          </button>
          <button className="flex-1 bg-white text-slate-400 border border-slate-200 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1">
             Belum
          </button>
        </div>

        <div className="mt-4">
           <p className="text-xs font-semibold text-slate-500 mb-2">KUALITAS BACAAN</p>
           <div className="flex gap-2">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">A</div>
              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center font-bold text-sm border border-slate-200">B</div>
              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center font-bold text-sm border border-slate-200">C</div>
           </div>
        </div>
      </div>

      <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm mt-auto shadow-md shadow-emerald-200">
        Simpan Data
      </button>
    </div>
  </div>
);

const faqs = [
  {
    q: "Bagaimana cara saya memantau progres ngaji anak saya?",
    a: "Anda tidak perlu repot membuat akun. Cukup minta Tautan/Link Akses Portal Orang Tua kepada Ustadz/Ustadzah atau Admin MDA, dan Anda bisa langsung melihat riwayat hafalan anak Anda."
  },
  {
    q: "Kurikulum apa yang digunakan di MDA Masjid Nurul Huda?",
    a: "Kami menggunakan metode pembelajaran interaktif untuk pengenalan dasar, yang dilanjutkan dengan program tahsin dan setoran tahfidz Al-Qur'an secara berkala."
  },
  {
    q: "Siapa yang menginput data nilai dan kehadiran santri?",
    a: "Setiap Ustadz dan Ustadzah pengajar memiliki akses khusus ke dalam sistem untuk mencatat kehadiran dan nilai setoran secara langsung saat kegiatan belajar mengajar berlangsung."
  }
];

// --- PUBLIC KABAR FEED COMPONENT ---
interface PublicPost {
  id: number;
  author: string;
  title: string;
  content: string;
  timestamp: string;
  avatar: string;
  images: string[];
}

const PublicKabarFeed = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/activities?page=1&limit=6&t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: PublicPost[] = json.data.map((p: any) => ({
            id: p.id,
            author: p.author_name || 'Admin MDA',
            title: p.title,
            content: p.content,
            timestamp: new Date(p.created_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            }),
            avatar: (p.author_name || 'A').charAt(0).toUpperCase(),
            images: Array.isArray(p.images) ? p.images : [],
          }));
          setPosts(mapped);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicPosts();
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
            <div className="h-48 bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-1/3 bg-slate-200 rounded" />
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-2/3 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="text-slate-400" size={28} />
        </div>
        <p className="text-slate-500 font-medium">Gagal memuat kabar. Coba refresh halaman.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Newspaper className="text-emerald-400" size={28} />
        </div>
        <p className="text-slate-500 font-medium">Belum ada kabar yang dipublikasikan.</p>
        <p className="text-slate-400 text-sm mt-1">Silakan cek kembali nanti.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <AnimateOnScroll key={post.id} animation="fade-up" delay={100 + idx * 80}>
            <div
              onClick={() => onNavigate && onNavigate(`kabar-detail?id=${post.id}`)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
              {/* Image or Placeholder */}
              {post.images.length > 0 ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm font-semibold">
                      +{post.images.length - 1} Foto
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                  <Newspaper className="text-emerald-300" size={40} />
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                {/* Author & Date */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{post.author}</p>
                    <div className="flex items-center gap-1 text-slate-400">
                      <CalendarDays size={10} />
                      <span className="text-[10px]">{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug line-clamp-2 flex-1">
                  {post.title}
                </h3>

                {/* Content Preview */}
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                  {post.content}
                </p>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Baca <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

    </>
  );
};

// --- MAIN APP COMPONENT ---
export default function LandingPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedRoleModal, setSelectedRoleModal] = useState<'admin' | 'teacher' | 'parent' | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={18} />
              </div>
              <span className="font-bold text-xl text-emerald-900">MDA Masjid Nurul Huda</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#solusi" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Solusi</a>
              <a href="#fitur" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Fitur</a>
              <a href="#peran" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Akses</a>
              <a href="#kabar" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5">
                <Newspaper size={15} /> Kabar
              </a>
            </div>
            <div>
              <button 
                onClick={() => onNavigate && onNavigate('login')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md shadow-emerald-200 text-sm">
                Masuk / Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-teal-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <AnimateOnScroll animation="fade-up" delay={100}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold mb-6">
                <span className="text-xl">🕌</span> Portal Akademik Resmi
              </span>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-up" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Portal Informasi & Akademik <br />
                <span className="text-emerald-600">MDA Masjid Nurul Huda.</span>
              </h1>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-up" delay={300}>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Sistem informasi akademik terpadu untuk pengurus, pengajar, dan orang tua santri MDA Masjid Nurul Huda. Pantau presensi, pencapaian hafalan, dan jurnal mengaji secara real-time.
              </p>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-up" delay={400} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => onNavigate && onNavigate('login')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group">
                Masuk Portal / Login
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </AnimateOnScroll>
          </div>
          
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <AnimateOnScroll animation="scale" delay={500} className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-[2.5rem] transform rotate-3 scale-105 opacity-20"></div>
               <MockAppUI />
               
               {/* Floating Badges */}
               <div className="absolute top-10 -left-10 z-50 bg-white p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Gema S. - Lulus</p>
                    <p className="text-sm font-bold">Doa Sesudah Makan</p>
                  </div>
               </div>
               
               <div className="absolute bottom-20 -right-8 z-50 bg-white p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Users size={20} /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Absensi Kelas</p>
                    <p className="text-sm font-bold text-slate-800">12/12 Hadir Hari Ini</p>
                  </div>
               </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* 2. LATAR BELAKANG SECTION */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimateOnScroll delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Transformasi Digital Pendidikan Al-Qur'an</h2>
              <p className="text-slate-500 mt-4 text-lg">MDA Masjid Nurul Huda kini mengadopsi sistem akademik modern untuk memastikan setiap progres belajar santri terpantau dengan akurat, transparan, dan mudah diakses oleh orang tua.</p>
              <div className="w-20 h-1 bg-emerald-400 mx-auto rounded-full mt-6"></div>
            </AnimateOnScroll>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimateOnScroll animation="fade-up" delay={200}>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 h-full hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Penyimpanan Data Aman</h3>
                <p className="text-slate-600 leading-relaxed">
                  Buku prestasi fisik rawan hilang, sobek, atau terselip. Dengan sistem digital, seluruh data akademik santri tersimpan aman di database tanpa khawatir kehilangan rekam jejak.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 h-full hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <History size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Rekapitulasi Otomatis</h3>
                <p className="text-slate-600 leading-relaxed">
                  Meringankan beban pengurus dalam merekap data kehadiran dan nilai setiap akhir bulan. Sistem menghasilkan laporan secara otomatis dan akurat.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={400}>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 h-full hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                  <Clock size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Informasi Real-Time</h3>
                <p className="text-slate-600 leading-relaxed">
                  Orang tua dapat memantau perkembangan hafalan dan kehadiran anak secara langsung tanpa harus menunggu buku prestasi dikembalikan.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* 3. SOLUTION & HOW IT WORKS */}
      <section id="solusi" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimateOnScroll delay={100}>
              <span className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2 block">Sistem Akademik Modern</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Dari Buku Fisik ke Sistem Digital yang Andal</h2>
              <p className="text-slate-300 text-lg">
                MDA Masjid Nurul Huda mengotomatiskan seluruh alur pencatatan agar pengajar fokus mendidik, dan pengurus mudah memantau perkembangan setiap santri.
              </p>
            </AnimateOnScroll>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-700 z-0"></div>

            {[
              {
                step: "1",
                title: "Catat Sekali Klik",
                desc: "Pengajar mengisi absensi dan nilai harian santri langsung dari smartphone. Cepat, praktis, dan anti-repot.",
                icon: <Smartphone size={32} />
              },
              {
                step: "2",
                title: "Terekap Otomatis",
                desc: "Data langsung tersimpan dengan aman di sistem. Tidak ada lagi proses hitung manual untuk laporan bulanan lembaga.",
                icon: <Database size={32} />
              },
              {
                step: "3",
                title: "Distribusi Real-Time",
                desc: "Orang tua langsung menerima update pencapaian anak detik itu juga melalui aplikasi atau WhatsApp.",
                icon: <Send size={32} />
              }
            ].map((item, idx) => (
              <AnimateOnScroll key={idx} animation="fade-up" delay={200 + (idx * 150)} className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-emerald-400 mb-6 shadow-xl shadow-emerald-900/20 relative">
                  {item.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full text-white font-bold flex items-center justify-center border-4 border-slate-900 text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MAIN FEATURES (Buku Penghubung) */}
      <section id="fitur" className="py-24 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="flex-1 order-2 lg:order-1 relative">
              <AnimateOnScroll animation="fade-right" delay={200}>
                {/* Mockup Desktop/Tablet UI for Parent Portal */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto bg-white px-4 py-1 rounded-md text-xs text-slate-500 font-mono shadow-sm border border-slate-100">
                      portal.mdanurulhuda.sch/wali/gema
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-2xl">GS</div>
                      <div>
                        <h4 className="font-bold text-xl text-slate-800">Gema Syaputra</h4>
                        <p className="text-emerald-600 font-semibold">Buku Penghubung Digital</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Timeline Item 1 */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5"></div>
                          <div className="w-0.5 h-full bg-emerald-100 my-1"></div>
                        </div>
                        <div className="pb-4 border-b border-slate-100 flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800">Hari Ini (Hadir)</span>
                            <span className="text-xs text-slate-500">10:45 WIB</span>
                          </div>
                          <p className="text-sm text-slate-600"><span className="font-semibold text-emerald-600">Materi:</span> Doa Sesudah Makan (Lulus)</p>
                          <p className="text-sm text-slate-600"><span className="font-semibold text-emerald-600">Nilai:</span> A (Sangat Baik)</p>
                          <div className="mt-2 bg-amber-50 p-2 rounded text-xs text-amber-800 border border-amber-100 flex gap-2 items-start">
                            <MessageCircle size={14} className="mt-0.5 shrink-0" />
                            <span>"Alhamdulillah Gema sudah hafal doa makan, tolong dirutinkan di rumah ya Bun." - Ustadz Ali</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeline Item 2 */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-slate-300 rounded-full mt-1.5"></div>
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800">Kemarin (Hadir)</span>
                            <span className="text-xs text-slate-500">25 Feb 2026</span>
                          </div>
                          <p className="text-sm text-slate-600"><span className="font-semibold text-blue-600">Setoran:</span> Iqra Jilid 4 Hal 15</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mock WA Bubble */}
                <div className="absolute -right-6 -bottom-6 bg-[#d9fdd3] p-4 rounded-2xl rounded-tr-none shadow-xl border border-green-200 max-w-[250px]">
                  <p className="text-sm text-slate-800 mb-2">
                    Assalamualaikum, Bunda. Berikut link laporan mengaji ananda Gema hari ini ya:
                  </p>
                  <a href="#" className="text-xs text-blue-600 underline truncate block">mdanurulhuda.sch/l/gema123</a>
                  <span className="text-[10px] text-slate-500 block text-right mt-1">11:00 ✓✓</span>
                </div>
              </AnimateOnScroll>
            </div>

            <div className="flex-1 order-1 lg:order-2">
              <AnimateOnScroll animation="fade-left" delay={100}>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Pantau Progres Anak Tanpa Menunggu Akhir Bulan
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Pengajar cukup membagikan satu tautan pintar (Smart Link). Orang tua dapat langsung mengakses "Portal Wali" untuk melihat rekam jejak belajar anak secara real-time dan transparan.
                </p>
              </AnimateOnScroll>

              <div className="space-y-6">
                {[
                  {
                    title: "Presensi Digital",
                    desc: "Pencatatan kehadiran santri yang cepat dan akurat. Orang tua dapat memantau status kehadiran anak setiap hari.",
                    icon: <CheckCircle2 className="text-emerald-500" size={24} />
                  },
                  {
                    title: "Pencatatan Hafalan",
                    desc: "Rekam jejak hafalan surat, doa, dan bacaan Iqro/Al-Qur'an secara terperinci beserta nilai kualitas bacaannya.",
                    icon: <BookOpen className="text-blue-500" size={24} />
                  },
                  {
                    title: "Jurnal Mengaji & Evaluasi",
                    desc: "Ustadz dapat memberikan catatan khusus (Jurnal Mengaji) sebagai evaluasi yang langsung dapat dibaca oleh wali santri.",
                    icon: <MessageCircle className="text-amber-500" size={24} />
                  }
                ].map((item, idx) => (
                  <AnimateOnScroll key={idx} animation="fade-left" delay={200 + (idx * 100)}>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-1">{item.title}</h4>
                        <p className="text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Removed AI KTP UPLOAD SECTION */}

      {/* 5. KEUNGGULAN BELAJAR */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Keunggulan Belajar di MDA Nurul Huda</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-16">Kami menggabungkan pendidikan agama Islam yang komprehensif dengan kemudahan teknologi informasi.</p>
          </AnimateOnScroll>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimateOnScroll animation="scale" delay={200}>
              <div className="bg-emerald-600 text-white p-10 rounded-3xl shadow-xl h-full flex flex-col items-start text-left">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen size={30} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Kurikulum Tahsin &amp; Tahfidz Terstruktur</h3>
                <p className="text-emerald-100 text-base leading-relaxed">
                  Membimbing santri dari dasar pengenalan huruf (Iqro) hingga tahsin Al-Qur&apos;an, dilengkapi dengan target hafalan surah pendek dan doa harian yang disesuaikan dengan jenjang usia anak.
                </p>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="scale" delay={300}>
              <div className="bg-slate-800 text-white p-10 rounded-3xl shadow-xl h-full flex flex-col items-start text-left">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={30} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Pantauan Akademik 100% Digital</h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  Transparansi adalah komitmen kami. Orang tua dapat langsung melihat laporan kehadiran, capaian hafalan, dan kelulusan jilid santri dari rumah secara real-time melalui Portal Orang Tua.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* 6. SERVICE TIERS / ROLES */}
      <section id="peran" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimateOnScroll delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Akses Pengguna Sistem</h2>
              <p className="text-lg text-slate-600">Sistem ini dirancang dengan hak akses yang disesuaikan untuk setiap peran di MDA Masjid Nurul Huda.</p>
            </AnimateOnScroll>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Role 1 */}
            <AnimateOnScroll animation="fade-up" delay={200}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden flex flex-col h-full group">
                <div className="h-2 bg-blue-500 w-full"></div>
                <div className="p-8 flex-1 flex flex-col">
                  <LayoutDashboard className="text-blue-500 mb-4" size={36} />
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Admin (Pengelola Data)</h3>
                  <p className="text-slate-600 mb-6 flex-1">
                    Bertanggung jawab mengelola data master (santri, pengajar, kelompok belajar), menyebarkan informasi/kabar, serta memantau statistik dan laporan rekapitulasi.
                  </p>
                  <button onClick={() => setSelectedRoleModal('admin')} className="text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lihat Detail Akses <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Role 2 */}
            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden flex flex-col h-full group">
                <div className="h-2 bg-emerald-500 w-full"></div>
                <div className="p-8 flex-1 flex flex-col">
                  <GraduationCap className="text-emerald-500 mb-4" size={36} />
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Pengajar / Ustadz (Pencatat Nilai &amp; Presensi)</h3>
                  <p className="text-slate-600 mb-6 flex-1">
                    Bertugas melakukan presensi kehadiran harian, memberikan penilaian hafalan/bacaan, dan menulis jurnal atau catatan evaluasi untuk setiap santri langsung dari smartphone.
                  </p>
                  <button onClick={() => setSelectedRoleModal('teacher')} className="text-emerald-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lihat Detail Akses <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Role 3 */}
            <AnimateOnScroll animation="fade-up" delay={400}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden flex flex-col h-full group">
                <div className="h-2 bg-amber-500 w-full"></div>
                <div className="p-8 flex-1 flex flex-col">
                  <Smartphone className="text-amber-500 mb-4" size={36} />
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Orang Tua Santri</h3>
                  <p className="text-slate-600 mb-6 flex-1">
                    Pantau progres mengaji anak tanpa perlu membuat akun atau login. Cukup gunakan tautan (link) khusus yang diberikan oleh pihak MDA untuk mengakses laporan anak secara real-time.
                  </p>
                  <button onClick={() => setSelectedRoleModal('parent')} className="text-amber-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lihat Detail Akses <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* 7. VISI MISI & SAMBUTAN */}
      <section className="py-20 bg-emerald-600 text-white relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <AnimateOnScroll delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Membangun Generasi Qur'ani</h2>
              <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                Melalui digitalisasi, kami berupaya memberikan pelayanan pendidikan agama yang lebih baik, terukur, dan transparan bagi seluruh pihak.
              </p>
            </AnimateOnScroll>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <AnimateOnScroll animation="fade-up" delay={200}>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="text-amber-300" fill="currentColor" size={24} /> Visi Kami
                </h3>
                <p className="text-emerald-50 leading-relaxed">
                  Menjadi lembaga pendidikan agama Islam yang unggul dalam mencetak generasi cinta Al-Qur'an, berakhlak mulia, dan siap menghadapi tantangan zaman dengan pondasi iman yang kuat.
                </p>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-300" size={24} /> Misi Kami
                </h3>
                <ul className="text-emerald-50 space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-2 shrink-0"></div>
                    <span>Menyelenggarakan kegiatan belajar mengaji yang interaktif dan efektif.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-2 shrink-0"></div>
                    <span>Mengoptimalkan teknologi informasi untuk transparansi dan komunikasi wali santri.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-2 shrink-0"></div>
                    <span>Membina akhlakul karimah melalui pembiasaan ibadah harian dan keteladanan.</span>
                  </li>
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* 8.5 PUBLIC KABAR SECTION */}
      <section id="kabar" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <AnimateOnScroll delay={100}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-4">
                <Newspaper size={15} /> Informasi Publik
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Kabar Terbaru MDA
              </h2>
              <p className="text-lg text-slate-500">
                Informasi, pengumuman, dan kegiatan terkini dari MDA Masjid Nurul Huda yang dapat dilihat oleh siapa saja.
              </p>
              <div className="w-20 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <PublicKabarFeed onNavigate={onNavigate} />
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <AnimateOnScroll delay={100}>
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Pertanyaan yang Sering Ditanyakan</h2>
             </AnimateOnScroll>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <AnimateOnScroll key={idx} animation="fade-up" delay={200 + (idx * 50)}>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
                  <button 
                    className="w-full text-left p-6 font-bold text-slate-800 flex justify-between items-center focus:outline-none"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`transform transition-transform duration-300 text-slate-400 ${openFaq === idx ? 'rotate-180' : ''}`} size={20} />
                  </button>
                  <div 
                    className={`px-6 text-slate-600 transition-all duration-300 ease-in-out overflow-hidden ${openFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    {faq.a}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 bg-slate-900 text-white text-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600 rounded-[100%] blur-[120px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll delay={100}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Portal Akademik & Presensi<br />
              <span className="text-emerald-400">MDA Masjid Nurul Huda</span>
            </h2>
          </AnimateOnScroll>
          
          <AnimateOnScroll delay={200}>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Sistem informasi terpadu untuk mendukung kelancaran kegiatan belajar mengajar dan pemantauan perkembangan santri secara digital.
            </p>
          </AnimateOnScroll>
          
          <AnimateOnScroll delay={300} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => onNavigate && onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-emerald-900/50">
              Masuk ke Portal
            </button>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2 font-bold text-white">
             <BookOpen className="text-emerald-500" size={18} />
             MDA Masjid Nurul Huda.
           </div>
           <p>© {new Date().getFullYear()} Hak Cipta Dilindungi. Platform Digital Madrasah & Masjid.</p>
           <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Syarat & Ketentuan</a>
           </div>
        </div>
      </footer>

      {/* Role Modal */}
      {selectedRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedRoleModal(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedRoleModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            {selectedRoleModal === 'admin' && (
              <div className="flex flex-col max-h-[90vh]">
                <div className="bg-blue-600 p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                    <LayoutDashboard size={48} className="mb-4 text-blue-200" />
                    <h2 className="text-3xl font-bold mb-2">Dasbor Pengurus / Admin</h2>
                    <p className="text-blue-100">Pusat kendali TPA/MDA Anda dalam satu genggaman.</p>
                </div>
                <div className="p-8 overflow-y-auto">
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Manajemen Data Santri & Pengajar yang rapi, bisa lihat statistik global.</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Membagikan pengumuman atau acara (Kabar Masjid) langsung ke semua Guru & Orang Tua.</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Cetak Laporan Otomatis. Tidak perlu kumpul buku absen lagi saat akhir semester.</span></li>
                    </ul>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-600 text-sm">
                        "Sebagai pengurus, ini menghemat ratusan jam saya di akhir semester. Semuanya terekam dengan jelas!"
                    </div>
                </div>
              </div>
            )}

            {selectedRoleModal === 'teacher' && (
              <div className="flex flex-col max-h-[90vh]">
                <div className="bg-emerald-600 p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                    <GraduationCap size={48} className="mb-4 text-emerald-200" />
                    <h2 className="text-3xl font-bold mb-2">Asisten Mengajar Digital</h2>
                    <p className="text-emerald-100">Fokus pada kualitas mengaji santri, biarkan sistem yang merekapnya.</p>
                </div>
                <div className="p-8 overflow-y-auto">
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Input nilai (A,B,C) dan setoran Iqro/Quran sangat cepat & efisien saat proses mengajar tanpa mengganggu konsentrasi.</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Klik & Tap Absensi Harian semudah menggunakan sosial media.</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Langsung bisa menulis pesan atau evaluasi hafalan (Doa/Sholat) yang otomatis terbaca oleh wali santri.</span></li>
                    </ul>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-600 text-sm flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                        <span>"Ustadz/ah tinggal mengajar seperti biasa, HP di atas meja. Lebih cepat dari mencari halaman di buku fisik."</span>
                    </div>
                </div>
              </div>
            )}

            {selectedRoleModal === 'parent' && (
              <div className="flex flex-col max-h-[90vh]">
                <div className="bg-amber-500 p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                    <Smartphone size={48} className="mb-4 text-amber-200" />
                    <h2 className="text-3xl font-bold mb-2">Portal Orang Tua</h2>
                    <p className="text-amber-100">Buku penghubung digital yang transparan dan informatif.</p>
                </div>
                <div className="p-8 overflow-y-auto">
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-amber-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Menerima link akses pintar (tanpa ribet password) langsung dari WhatsApp.</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-amber-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Melihat detail anaknya sampai Iqro jilid berapa atau hafalannya sudah sampai di mana.</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-amber-500 shrink-0 mt-1" size={20} /> <span className="text-slate-700">Melihat pesan penyemangat atau teguran dari Ustadz di satu layar interaktif yang mudah dipahami.</span></li>
                    </ul>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => {
                                setSelectedRoleModal(null);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="bg-amber-50 text-amber-600 px-6 py-2.5 rounded-full font-bold hover:bg-amber-100 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}