'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Users, GraduationCap, Star, CheckCircle2, ChevronDown,
  MapPin, Phone, Mail, Clock, Calendar, ChevronRight,
  Newspaper, CalendarDays, RefreshCw, ArrowRight, Heart,
  ScrollText, Sparkles
} from 'lucide-react';

// ───────────────────────────────────────────────────────────
// Hook: animate when element scrolls into view
// ───────────────────────────────────────────────────────────
const useElementOnScreen = (options: IntersectionObserverInit) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
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

const AnimateOnScroll = ({ children, className = '', delay = 0, animation = 'fade-up' }: AnimateOnScrollProps) => {
  const [ref, isVisible] = useElementOnScreen({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  });

  const getAnimationClasses = () => {
    if (!isVisible) {
      if (animation === 'fade-up') return 'opacity-0 translate-y-10';
      if (animation === 'fade-left') return 'opacity-0 translate-x-10';
      if (animation === 'fade-right') return 'opacity-0 -translate-x-10';
      if (animation === 'scale') return 'opacity-0 scale-95';
      return 'opacity-0';
    }
    return 'opacity-100 translate-y-0 translate-x-0 scale-100';
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

// ───────────────────────────────────────────────────────────
// PublicKabarFeed — feed kabar publik (di-import di section Kabar)
// ───────────────────────────────────────────────────────────
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
              day: 'numeric', month: 'long', year: 'numeric',
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
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, idx) => (
        <AnimateOnScroll key={post.id} animation="fade-up" delay={100 + idx * 80}>
          <div
            onClick={() => onNavigate && onNavigate(`kabar-detail?id=${post.id}`)}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
          >
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

              <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug line-clamp-2 flex-1">
                {post.title}
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                {post.content}
              </p>

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
  );
};

// ───────────────────────────────────────────────────────────
// MAIN LANDING PAGE
// ───────────────────────────────────────────────────────────
export default function LandingPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="text-white" size={18} />
              </div>
              <div className="leading-tight">
                <p className="font-extrabold text-base text-emerald-900">MDA Masjid Nurul Huda</p>
                <p className="text-[10px] text-slate-500 hidden sm:block">Madrasah Diniyah Awaliyah</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-7 text-sm">
              <a href="#profil" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Profil</a>
              <a href="#program" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Program</a>
              <a href="#pengajar" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Pengajar</a>
              <a href="#kabar" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Kabar</a>
              <a href="#pendaftaran" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Pendaftaran</a>
              <a href="#kontak" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Kontak</a>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('login')}
              className="text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm border border-emerald-200 hover:bg-emerald-50 transition-all"
            >
              Login Pengajar
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-teal-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            <AnimateOnScroll animation="fade-up" delay={100}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold mb-6">
                🕌 Madrasah Diniyah Awaliyah
              </span>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Mendidik Generasi <br />
                <span className="text-emerald-600">Qur'ani Sejak Dini</span>
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Selamat datang di <strong className="text-slate-800">MDA Masjid Nurul Huda</strong>, lembaga pendidikan agama Islam binaan Masjid Nurul Huda Simpang Piai, Padang.
                Kami membimbing anak-anak mengenal Al-Qur'an, hafalan, dan akhlak Islami dengan metode yang menyenangkan dan terstruktur.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={400} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#pendaftaran"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-base transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group"
              >
                Pendaftaran Santri Baru
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </a>
              <a
                href="#profil"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-emerald-700 rounded-full font-bold text-base transition-all border-2 border-emerald-100 flex items-center justify-center gap-2"
              >
                Profil Madrasah
              </a>
            </AnimateOnScroll>
          </div>

          {/* Right: Decorative card with arabic motif */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <AnimateOnScroll animation="scale" delay={500} className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-[2.5rem] shadow-2xl shadow-emerald-200 p-10 relative overflow-hidden">
                {/* Decorative islamic pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
                  <div className="absolute bottom-10 right-10 w-40 h-40 border-4 border-white rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-white rounded-full" />
                </div>
                <div className="relative h-full flex flex-col justify-between text-white">
                  <div>
                    <Sparkles className="text-amber-300 mb-4" size={32} />
                    <p className="text-3xl md:text-4xl font-arabic leading-loose mb-2" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                      ﷽
                    </p>
                    <p className="text-emerald-100 text-sm italic">Bismillahirrahmanirrahim</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold leading-snug mb-3">
                      "Sebaik-baik kalian adalah yang belajar Al-Qur'an dan mengajarkannya."
                    </p>
                    <p className="text-emerald-200 text-sm">— HR. Bukhari</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════ PROFIL SINGKAT (Stats) ═══════════════ */}
      <section id="profil" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll delay={100} className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-2 block">Tentang Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Madrasah Tempat Anak Tumbuh dalam Iman</h2>
            <p className="text-slate-600 leading-relaxed">
              {/* TODO: ganti dengan data asli */}
              MDA Masjid Nurul Huda berdiri sejak tahun 2010 sebagai bagian dari kegiatan pembinaan keagamaan
              Masjid Nurul Huda Simpang Piai. Hingga kini kami terus mendampingi anak-anak warga sekitar dalam
              perjalanan mengenal dan mencintai Al-Qur'an.
            </p>
            <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: '120+', label: 'Santri Aktif', icon: <Users size={22} /> },
              { value: '8', label: 'Pengajar', icon: <GraduationCap size={22} /> },
              { value: '5', label: 'Kelompok Belajar', icon: <BookOpen size={22} /> },
              { value: '15+', label: 'Tahun Berdiri', icon: <Heart size={22} /> },
            ].map((stat, idx) => (
              <AnimateOnScroll key={idx} animation="fade-up" delay={150 + idx * 80}>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 md:p-6 text-center hover:shadow-md hover:border-emerald-200 transition-all">
                  <div className="w-12 h-12 mx-auto bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                    {stat.icon}
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-emerald-700 mb-1">{stat.value}</p>
                  <p className="text-xs md:text-sm font-bold text-slate-600">{stat.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
      {/* ═══════════════ SAMBUTAN KEPALA MDA ═══════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            {/* Foto Kepala MDA (placeholder) */}
            <AnimateOnScroll animation="fade-right" delay={100} className="md:col-span-2">
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center overflow-hidden shadow-xl">
                  {/* TODO: ganti dengan foto Kepala MDA */}
                  <div className="text-center text-emerald-700 px-6">
                    <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                      <GraduationCap size={56} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Foto Kepala MDA</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg">
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Kepala MDA</p>
                  <p className="font-bold text-sm">Ust. Ahmad Fauzi, S.Pd.I</p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Sambutan */}
            <AnimateOnScroll animation="fade-left" delay={200} className="md:col-span-3">
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-3 block">Sambutan Kepala MDA</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-snug">
                Assalamualaikum wr. wb. Selamat datang di MDA Masjid Nurul Huda.
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                {/* TODO: ganti dengan sambutan asli Kepala MDA */}
                <p>
                  Alhamdulillah, segala puji bagi Allah SWT. Atas izin-Nya, MDA Masjid Nurul Huda terus berusaha
                  menjadi tempat yang nyaman bagi anak-anak dalam mempelajari Al-Qur'an, hafalan, dan akhlak Islami.
                </p>
                <p>
                  Kami menyadari bahwa pendidikan agama anak adalah amanah yang besar. Karena itu, kami berkomitmen
                  membimbing setiap santri sesuai jenjang dan kemampuannya, mulai dari pengenalan huruf hijaiyah,
                  bacaan Iqro, hingga tahsin Al-Qur'an dan hafalan surah-surah pendek.
                </p>
                <p>
                  Semoga setiap langkah belajar yang ditempuh anak-anak kita di sini menjadi pondasi iman yang kokoh,
                  insya Allah. Wassalamualaikum wr. wb.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="font-bold text-slate-800">Ust. Ahmad Fauzi, S.Pd.I</p>
                <p className="text-sm text-slate-500">Kepala MDA Masjid Nurul Huda</p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════ VISI & MISI ═══════════════ */}
      <section className="py-20 bg-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-56 h-56 border-4 border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimateOnScroll delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Membangun Generasi Qur'ani</h2>
              <p className="text-emerald-100 text-lg">
                Pendidikan agama yang terstruktur, transparan, dan berlandaskan kasih sayang.
              </p>
            </AnimateOnScroll>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <AnimateOnScroll animation="fade-up" delay={200}>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="text-amber-300" fill="currentColor" size={22} /> Visi
                </h3>
                <p className="text-emerald-50 leading-relaxed">
                  Menjadi lembaga pendidikan agama Islam yang unggul dalam mencetak generasi cinta Al-Qur'an,
                  berakhlak mulia, dan siap menghadapi tantangan zaman dengan pondasi iman yang kuat.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-300" size={22} /> Misi
                </h3>
                <ul className="text-emerald-50 space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-2 shrink-0" />
                    <span>Menyelenggarakan kegiatan belajar mengaji yang interaktif dan efektif.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-2 shrink-0" />
                    <span>Menjaga komunikasi terbuka antara pengajar dan wali santri.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-2 shrink-0" />
                    <span>Membina akhlakul karimah melalui pembiasaan ibadah harian dan keteladanan.</span>
                  </li>
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
      {/* ═══════════════ PROGRAM BELAJAR ═══════════════ */}
      <section id="program" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <AnimateOnScroll delay={100}>
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-2 block">Program Pembelajaran</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Materi yang Diajarkan di MDA</h2>
              <p className="text-slate-600 leading-relaxed">
                Kami menyusun materi belajar secara bertahap, sesuai jenjang usia dan kemampuan santri.
              </p>
              <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Iqro & Tahsin',
                desc: 'Pengenalan huruf hijaiyah, makharijul huruf, hingga lancar membaca Al-Qur\'an dengan tartil.',
                icon: <BookOpen size={26} />,
                color: 'emerald',
              },
              {
                title: 'Tahfidz Juz 30',
                desc: 'Hafalan surah-surah pendek dari Juz 30 (Juz \'Amma) yang biasa dibaca dalam sholat sehari-hari.',
                icon: <ScrollText size={26} />,
                color: 'teal',
              },
              {
                title: 'Doa Harian & Bacaan Sholat',
                desc: 'Menghafal doa-doa harian dan bacaan sholat lengkap beserta artinya dengan benar.',
                icon: <Sparkles size={26} />,
                color: 'amber',
              },
              {
                title: 'Akhlak & Adab Islami',
                desc: 'Pembiasaan adab Islami sehari-hari, sopan santun, dan akhlak mulia melalui keteladanan.',
                icon: <Heart size={26} />,
                color: 'rose',
              },
            ].map((prog, idx) => {
              const colors: Record<string, { bg: string; iconBg: string; iconColor: string; border: string }> = {
                emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-600', iconColor: 'text-white', border: 'hover:border-emerald-300' },
                teal: { bg: 'bg-teal-50', iconBg: 'bg-teal-600', iconColor: 'text-white', border: 'hover:border-teal-300' },
                amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-500', iconColor: 'text-white', border: 'hover:border-amber-300' },
                rose: { bg: 'bg-rose-50', iconBg: 'bg-rose-500', iconColor: 'text-white', border: 'hover:border-rose-300' },
              };
              const c = colors[prog.color];
              return (
                <AnimateOnScroll key={idx} animation="fade-up" delay={150 + idx * 80}>
                  <div className={`${c.bg} border-2 border-transparent ${c.border} rounded-2xl p-6 h-full transition-all hover:shadow-md`}>
                    <div className={`w-14 h-14 ${c.iconBg} ${c.iconColor} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                      {prog.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{prog.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{prog.desc}</p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>
      {/* ═══════════════ JADWAL KEGIATAN BELAJAR ═══════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <AnimateOnScroll delay={100}>
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-2 block">Jadwal Kegiatan</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Waktu Belajar Mengaji</h2>
              <p className="text-slate-600 leading-relaxed">
                Kegiatan belajar mengaji dilaksanakan setiap hari kerja sore hari, sesuai kelompok belajar santri.
              </p>
              <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card: Hari & Jam */}
            <AnimateOnScroll animation="fade-right" delay={150}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <Clock size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hari & Jam</p>
                    <h3 className="text-lg font-bold text-slate-800">Senin – Jumat</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Mulai Belajar</span>
                    <span className="font-bold text-slate-800">14.30 WIB</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Istirahat / Sholat Ashar</span>
                    <span className="font-bold text-slate-800">15.30 WIB</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-slate-600">Selesai</span>
                    <span className="font-bold text-emerald-700">16.30 WIB</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic mt-4">
                  *Sabtu & Minggu libur. Hari libur nasional menyesuaikan kalender.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Card: Kelompok Belajar */}
            <AnimateOnScroll animation="fade-left" delay={250}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kelompok Belajar</p>
                    <h3 className="text-lg font-bold text-slate-800">Berdasarkan Jenjang</h3>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'Iqro Jilid 1 – 2', age: 'Pemula' },
                    { name: 'Iqro Jilid 3 – 4', age: 'Lanjutan Awal' },
                    { name: 'Iqro Jilid 5 – 6', age: 'Lanjutan' },
                    { name: 'Al-Qur\'an Pemula', age: 'Tahsin Dasar' },
                    { name: 'Al-Qur\'an Lanjutan', age: 'Tahfidz Juz 30' },
                  ].map((g, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 flex-1">{g.name}</span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {g.age}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════ PENGAJAR ═══════════════ */}
      <section id="pengajar" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <AnimateOnScroll delay={100}>
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-2 block">Tim Pengajar</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ustadz & Ustadzah Kami</h2>
              <p className="text-slate-600 leading-relaxed">
                {/* TODO: ganti dengan deskripsi dari pengurus */}
                Tim pengajar berlatar belakang pendidikan Islam dan berpengalaman membimbing santri dengan
                metode yang ramah anak.
              </p>
              <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { name: 'Ust. Ali Hidayat', role: 'Pengajar Senior — Iqro & Tahsin' },
              { name: 'Ust. Hasan Mubarak', role: 'Pengajar — Tahfidz Juz 30' },
              { name: 'Ustdz. Aisyah Rahmi', role: 'Pengajar — Doa Harian' },
              { name: 'Ustdz. Khadijah Salwa', role: 'Pengajar — Akhlak & Adab' },
            ].map((t, idx) => (
              <AnimateOnScroll key={idx} animation="fade-up" delay={120 + idx * 80}>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
                  {/* Foto placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative overflow-hidden">
                    {/* TODO: ganti dengan foto pengajar */}
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <GraduationCap size={32} className="text-emerald-600" />
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-bold text-sm text-slate-800 mb-1">{t.name}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{t.role}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
      {/* ═══════════════ KABAR & KEGIATAN ═══════════════ */}
      <section id="kabar" className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <AnimateOnScroll delay={100}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-3">
                <Newspaper size={13} /> Kegiatan Madrasah
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Kabar & Kegiatan Terbaru</h2>
              <p className="text-slate-600 leading-relaxed">
                Pengumuman, dokumentasi kegiatan, dan informasi terkini dari MDA Masjid Nurul Huda.
              </p>
              <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <PublicKabarFeed onNavigate={onNavigate} />
        </div>
      </section>

      {/* ═══════════════ BUKU PENGHUBUNG DIGITAL ═══════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll delay={100}>
            <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl border border-emerald-100 p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-emerald-700 text-[11px] font-bold mb-4 border border-emerald-100">
                    <Sparkles size={12} /> Fasilitas Digital
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
                    Buku Penghubung Digital untuk Wali Santri
                  </h2>
                  <p className="text-slate-600 leading-relaxed mb-5 text-sm md:text-base">
                    MDA Masjid Nurul Huda menyediakan portal pemantauan online agar orang tua dapat memantau
                    kehadiran, capaian hafalan, dan catatan dari ustadz/ustadzah secara berkala. Tautan portal
                    diberikan langsung oleh pengajar — tanpa perlu mendaftar akun.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <span>Lihat presensi harian anak</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <span>Pantau capaian Iqro / hafalan doa & sholat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <span>Cetak laporan PDF perkembangan santri</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => onNavigate && onNavigate('login')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 rounded-full font-semibold text-sm border border-emerald-200 transition-all"
                  >
                    Login Pengajar / Admin <ArrowRight size={14} />
                  </button>
                </div>

                {/* Visual placeholder kecil */}
                <div className="relative">
                  <div className="aspect-[4/3] bg-emerald-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-24 h-24 border-4 border-white rounded-full" />
                      <div className="absolute bottom-4 left-4 w-32 h-32 border-2 border-white rounded-full" />
                    </div>
                    <div className="relative">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Portal Wali</p>
                      <p className="font-bold text-lg mb-3">Ananda Aisyah</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
                          <span>Kehadiran bulan ini</span>
                          <span className="font-bold">18/20</span>
                        </div>
                        <div className="flex justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
                          <span>Iqro</span>
                          <span className="font-bold">Jilid 4 — Hal. 12</span>
                        </div>
                        <div className="flex justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
                          <span>Hafalan terbaru</span>
                          <span className="font-bold">Doa Sebelum Tidur ✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
      {/* ═══════════════ PENDAFTARAN SANTRI BARU ═══════════════ */}
      <section id="pendaftaran" className="py-20 bg-gradient-to-br from-emerald-700 to-teal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border-2 border-white rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <AnimateOnScroll delay={100}>
              <span className="text-amber-300 font-bold tracking-wider uppercase text-xs mb-2 block">Pendaftaran Santri Baru</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Bergabung Bersama Kami</h2>
              <p className="text-emerald-100 leading-relaxed">
                Pendaftaran dilakukan secara langsung di sekretariat MDA Masjid Nurul Huda. Hubungi kami untuk
                informasi lebih lanjut.
              </p>
              <div className="w-16 h-1 bg-amber-300 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card: Syarat Pendaftaran */}
            <AnimateOnScroll animation="fade-right" delay={150}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-amber-300 text-emerald-800 rounded-xl flex items-center justify-center shadow-md">
                    <ScrollText size={22} />
                  </div>
                  <h3 className="text-xl font-bold">Syarat & Ketentuan</h3>
                </div>
                <ul className="space-y-3 text-sm text-emerald-50">
                  {/* TODO: ganti dengan syarat asli dari pengurus */}
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-amber-300 shrink-0 mt-0.5" size={18} />
                    <span>Anak berusia 5 - 12 tahun (jenjang TK hingga SD)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-amber-300 shrink-0 mt-0.5" size={18} />
                    <span>Mengisi formulir pendaftaran di sekretariat masjid</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-amber-300 shrink-0 mt-0.5" size={18} />
                    <span>Membawa fotokopi akta kelahiran & Kartu Keluarga</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-amber-300 shrink-0 mt-0.5" size={18} />
                    <span>Pas foto anak ukuran 3x4 (2 lembar)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-amber-300 shrink-0 mt-0.5" size={18} />
                    <span>Kontribusi infaq seikhlasnya untuk operasional MDA</span>
                  </li>
                </ul>
              </div>
            </AnimateOnScroll>

            {/* Card: Cara Mendaftar */}
            <AnimateOnScroll animation="fade-left" delay={250}>
              <div className="bg-white text-slate-800 rounded-2xl shadow-xl p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <Calendar size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Cara Mendaftar</h3>
                </div>
                <ol className="space-y-4 text-sm text-slate-700 mb-6">
                  <li className="flex gap-3">
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <span>Hubungi sekretariat MDA via WhatsApp atau datang langsung ke Masjid Nurul Huda.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <span>Isi formulir pendaftaran dan lengkapi berkas yang dibutuhkan.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs flex items-center justify-center shrink-0">3</span>
                    <span>Tunggu konfirmasi dari pengurus terkait kelompok belajar dan jadwal mulai mengaji.</span>
                  </li>
                </ol>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-amber-700 mb-1">📅 Pendaftaran Dibuka</p>
                  <p className="text-sm text-amber-900 font-semibold">Sepanjang tahun, sesuai ketersediaan kuota</p>
                </div>
                <a
                  href="https://wa.me/6281234567890?text=Assalamualaikum,%20saya%20ingin%20bertanya%20tentang%20pendaftaran%20santri%20MDA%20Masjid%20Nurul%20Huda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-sm transition-all shadow-md"
                >
                  <Phone size={16} /> Hubungi Sekretariat (WhatsApp)
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-3">
                  {/* TODO: ganti dengan nomor WA asli */}
                  +62 812-3456-7890 (Sekretariat MDA)
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════ LOKASI & KONTAK ═══════════════ */}
      <section id="kontak" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <AnimateOnScroll delay={100}>
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-2 block">Lokasi & Kontak</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Hubungi Kami</h2>
              <p className="text-slate-600 leading-relaxed">
                Silakan datang langsung ke masjid atau hubungi kami melalui kontak di bawah ini.
              </p>
              <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Alamat */}
            <AnimateOnScroll animation="fade-up" delay={150}>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <MapPin size={22} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Alamat</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Masjid Nurul Huda Simpang Piai, Kelurahan Cupak Tangah, Kecamatan Pauh, Kota Padang, Sumatera Barat
                </p>
              </div>
            </AnimateOnScroll>

            {/* Kontak */}
            <AnimateOnScroll animation="fade-up" delay={250}>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Phone size={22} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Kontak</h3>
                <p className="text-sm text-slate-600 mb-1.5 flex items-center gap-2">
                  <span className="font-semibold">WA:</span>
                  {/* TODO: ganti dengan nomor asli */}
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                    +62 812-3456-7890
                  </a>
                </p>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <a href="mailto:info@mdanurulhuda.or.id" className="text-emerald-700 hover:underline break-all">
                    info@mdanurulhuda.or.id
                  </a>
                </p>
              </div>
            </AnimateOnScroll>

            {/* Jam Operasional */}
            <AnimateOnScroll animation="fade-up" delay={350}>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Clock size={22} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Jam Operasional</h3>
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-semibold">Senin – Jumat:</span> 14.30 – 16.30 WIB
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Sabtu & Minggu:</span> Libur
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Map Placeholder */}
          <AnimateOnScroll delay={400} className="mt-8">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              {/* TODO: ganti dengan embed Google Maps yang sesuai */}
              <iframe
                title="Lokasi MDA Masjid Nurul Huda"
                src="https://www.google.com/maps?q=Masjid+Nurul+Huda+Simpang+Piai+Cupak+Tangah+Pauh+Padang&output=embed"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <AnimateOnScroll delay={100}>
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-2 block">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Pertanyaan yang Sering Ditanyakan</h2>
              <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mt-6" />
            </AnimateOnScroll>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Berapa usia minimal anak untuk bisa mendaftar di MDA?',
                a: 'Kami menerima santri mulai usia 5 tahun. Untuk anak yang lebih muda, silakan diskusikan dengan pengurus apakah ananda sudah siap belajar dalam kelompok.',
              },
              {
                q: 'Bagaimana cara saya memantau progres mengaji anak?',
                a: 'Anda tidak perlu membuat akun. Pengajar akan memberikan tautan akses Portal Wali Santri yang bisa dibuka kapan saja untuk melihat presensi, capaian Iqro, dan hafalan anak.',
              },
              {
                q: 'Apakah ada biaya pendaftaran atau iuran bulanan?',
                a: 'Pendaftaran dan kegiatan belajar berbasis infaq seikhlasnya untuk membantu operasional MDA. Detail kontribusi bisa ditanyakan langsung ke sekretariat.',
              },
              {
                q: 'Apa saja yang akan dipelajari santri?',
                a: 'Materi mencakup Iqro/Tahsin Al-Qur\'an, Tahfidz Juz 30, Doa Harian, Bacaan Sholat, serta pembiasaan akhlak Islami. Materi disesuaikan dengan jenjang belajar santri.',
              },
              {
                q: 'Apakah pendaftaran dibuka sepanjang tahun?',
                a: 'Ya, pendaftaran dibuka sepanjang tahun selama kuota kelompok masih tersedia. Untuk informasi terkini, hubungi sekretariat MDA.',
              },
            ].map((faq, idx) => (
              <AnimateOnScroll key={idx} animation="fade-up" delay={150 + idx * 60}>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all">
                  <button
                    className="w-full text-left p-5 font-bold text-slate-800 flex justify-between items-center focus:outline-none gap-4"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span className="text-sm md:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`shrink-0 transform transition-transform duration-300 text-slate-400 ${openFaq === idx ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>
                  <div
                    className={`px-5 text-slate-600 text-sm transition-all duration-300 ease-in-out overflow-hidden ${
                      openFaq === idx ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {faq.a}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-emerald-900 text-emerald-100 pt-12 pb-6 border-t border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-white text-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
                  <BookOpen size={18} />
                </div>
                <p className="font-extrabold text-base text-white">MDA Masjid Nurul Huda</p>
              </div>
              <p className="text-sm text-emerald-200 leading-relaxed">
                Lembaga pendidikan agama Islam binaan Masjid Nurul Huda Simpang Piai, Padang.
                Mendidik generasi cinta Al-Qur'an dengan metode yang menyenangkan dan terstruktur.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-3">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#profil" className="hover:text-white transition-colors">Profil Madrasah</a></li>
                <li><a href="#program" className="hover:text-white transition-colors">Program Belajar</a></li>
                <li><a href="#pengajar" className="hover:text-white transition-colors">Pengajar</a></li>
                <li><a href="#kabar" className="hover:text-white transition-colors">Kabar & Kegiatan</a></li>
                <li><a href="#pendaftaran" className="hover:text-white transition-colors">Pendaftaran</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-3">Kontak</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>Masjid Nurul Huda, Simpang Piai, Cupak Tangah, Pauh, Padang</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0 text-emerald-400" />
                  {/* TODO: ganti dengan nomor asli */}
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    +62 812-3456-7890
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0 text-emerald-400" />
                  <a href="mailto:info@mdanurulhuda.or.id" className="hover:text-white transition-colors break-all">
                    info@mdanurulhuda.or.id
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-emerald-800 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-emerald-300">
            <p>© {new Date().getFullYear()} MDA Masjid Nurul Huda. Hak Cipta Dilindungi.</p>
            <p className="italic">"Sebaik-baik kalian adalah yang belajar Al-Qur'an dan mengajarkannya."</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
