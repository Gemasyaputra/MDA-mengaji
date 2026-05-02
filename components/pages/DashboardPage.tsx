'use client';

import { useEffect, useState } from 'react';
import { Activity, BookOpen, Clock, Home, MapPin, Users } from 'lucide-react';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

interface DashboardPageProps {
  role: string | null;
  onNavigate: (page: string) => void;
  currentUser?: any;
}

interface PrayerTime {
  name: string;
  time: string;
}

interface AladhanResponse {
  code: number;
  data: {
    date: {
      hijri: {
        day: string;
        month: { en: string };
        year: string;
      };
      gregorian: {
        date: string;
        weekday: { en: string };
      };
    };
    timings: Record<string, string>;
  };
}

const PRAYERS = [
  { id: 'Fajr', label: 'Subuh' },
  { id: 'Dhuhr', label: 'Dhuhr' },
  { id: 'Asr', label: 'Asr' },
  { id: 'Maghrib', label: 'Maghrib' },
  { id: 'Isha', label: 'Isha' },
] as const;

const WEEKDAY_ID: Record<string, string> = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu',
};

export default function DashboardPage({ role, onNavigate, currentUser }: DashboardPageProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('Memuat...');
  const [gregDate, setGregDate] = useState<string>('Memuat...');
  const [locationLabel, setLocationLabel] = useState<string>('Mencari Lokasi...');
  const [nextPrayerName, setNextPrayerName] = useState<string>('...');
  const [nextPrayerTime, setNextPrayerTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--:--');
  const [stats, setStats] = useState({ total_santri: 0, present_today: 0, total_teachers: 0, total_groups: 0 });

  // Fetch Dashboard Stats
  useEffect(() => {
      const fetchStats = async () => {
          try {
              let url = `/api/dashboard/stats`;
              if (currentUser?.role === 'teacher' && currentUser?.id) {
                  url += `?teacher_id=${currentUser.id}`;
              }
              const res = await fetch(url);
              const json = await res.json();
              if (json.success) {
                  setStats(json.data);
              }
          } catch (err) {
              console.error(err);
          }
      };
      fetchStats();
  }, [currentUser]);

  // Ambil jadwal shalat dari API Aladhan (dengan geolokasi jika ada)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchPrayerTimes = async (lat: number, lng: number) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=11`;

      try {
        const res = await fetch(url);
        const json: AladhanResponse = await res.json();

        if (json.code !== 200) return;

        const { date, timings } = json.data;

        // Tanggal Hijriyah
        const h = date.hijri;
        setHijriDate(`${h.day} ${h.month.en} ${h.year} H`);

        // Tanggal Masehi + hari Indonesia
        const g = date.gregorian;
        const hariId = WEEKDAY_ID[g.weekday.en] ?? g.weekday.en;
        setGregDate(`${hariId}, ${g.date}`);

        // Lokasi label
        setLocationLabel((prev) =>
          prev === 'Mencari Lokasi...' ? 'Lokasi Terkini' : prev,
        );

        // Grid jadwal shalat + hitung shalat berikutnya
        const now = new Date();
        let upcomingName = '';
        let upcomingTime: Date | null = null;
        let minDiff = Infinity;

        const timesForState: PrayerTime[] = PRAYERS.map((p) => {
          const timeStr = timings[p.id]; // "HH:MM"

          const [hours, minutes] = timeStr.split(':').map((n) => parseInt(n, 10));
          const pTime = new Date();
          pTime.setHours(hours, minutes, 0, 0);

          if (pTime > now) {
            const diff = pTime.getTime() - now.getTime();
            if (diff < minDiff) {
              minDiff = diff;
              upcomingName = p.label;
              upcomingTime = pTime;
            }
          }

          return { name: p.label, time: timeStr };
        });

        // Jika sudah lewat Isya, set ke Subuh besok
        if (!upcomingTime) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const fajrTime = timings['Fajr'];
          const [fh, fm] = fajrTime.split(':').map((n) => parseInt(n, 10));
          tomorrow.setHours(fh, fm, 0, 0);
          upcomingTime = tomorrow;
          upcomingName = 'Subuh';
        }

        setPrayerTimes(timesForState);
        setNextPrayerName(upcomingName);
        setNextPrayerTime(upcomingTime);
      } catch {
        setHijriDate('Gagal memuat data');
      }
    };

    if (navigator.geolocation) {
      setLocationLabel('Mencari Lokasi...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setLocationLabel('Jakarta (Default)');
          fetchPrayerTimes(-6.2088, 106.8456);
        },
      );
    } else {
      setLocationLabel('Jakarta (Default)');
      fetchPrayerTimes(-6.2088, 106.8456);
    }
  }, []);

  // Jam realtime + countdown menuju shalat berikutnya
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour12: false,
        }),
      );

      if (nextPrayerTime) {
        const diff = nextPrayerTime.getTime() - now.getTime();
        if (diff > 0) {
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor(
            (diff % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          const pad = (n: number) => n.toString().padStart(2, '0');
          setCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        } else {
          setCountdown('00:00:00');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextPrayerTime]);

  const dashboardMenu = [
    {
      icon: Users,
      label: 'Santri',
      page: 'santri-list',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      icon: Activity,
      label: 'Presensi',
      page: 'presensi',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: BookOpen,
      label: 'Setoran Doa',
      page: 'input-hafalan-doa',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      icon: Users,
      label: 'Kelompok',
      page: 'study-groups',
      color: 'bg-orange-50 text-orange-600 border-orange-100',
    },
  ];

  if (role === 'admin') {
      dashboardMenu.push({
          icon: Users,
          label: 'Data Guru',
          page: 'manage-teachers',
          color: 'bg-teal-50 text-teal-600 border-teal-100',
      });
  }

  if (role === 'teacher') {
      dashboardMenu.push({
          icon: BookOpen,
          label: 'Setoran Tilawah',
          page: 'input-iqro',
          color: 'bg-purple-50 text-purple-600 border-purple-100',
      });
  }

  if (role === 'admin' || role === 'teacher') {
      dashboardMenu.push({
          icon: BookOpen,
          label: 'Bank Materi',
          page: 'master-hafalan',
          color: 'bg-purple-50 text-purple-600 border-purple-100',
      });
  }

  return (
    <div className="p-4 md:p-8">
      {/* Kartu Salam + Jadwal Shalat ala desain */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between">
        <div className="absolute right-0 top-0 opacity-10 text-8xl -mr-4 -mt-4">
          <Home size={80} />
        </div>
        
        <div className="md:w-1/2 z-10">
          <p className="text-sm opacity-90 mb-1">Assalamualaikum,</p>
          <h2 className="text-2xl font-bold mb-3">{currentUser?.name || 'Ustadz Ali'}</h2>
          
          <div className="md:hidden flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm mb-4">
            <Users size={12} className="mr-1" />
            <span>MDA Masjid Nurul Huda</span>
          </div>
          
          <div className="hidden md:block mt-4">
            <p className="text-emerald-50 font-medium text-sm mb-1">{hijriDate} • {gregDate}</p>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5">
              <MapPin size={12} /> {locationLabel}
            </p>
          </div>
        </div>

        <div className="md:w-1/2 md:bg-white/10 md:rounded-2xl md:p-5 md:backdrop-blur-sm mt-4 md:mt-0 z-10 md:max-w-md">
          <div className="md:hidden border-t border-white/20 pt-3 mt-3"></div>
          
          <div className="flex justify-between items-center mb-3">
            <div className="text-[10px] space-y-1 md:hidden">
              <p className="text-emerald-100 font-medium">{hijriDate}</p>
              <p className="text-[11px] font-bold text-white">{gregDate}</p>
              <p className="text-[9px] text-emerald-200 flex items-center gap-1">
                <MapPin size={10} />
                <span>{locationLabel}</span>
              </p>
            </div>
            
            <div className="text-right md:text-left md:flex md:justify-between md:w-full md:items-center">
              <div>
                <p className="text-[9px] md:text-xs text-emerald-100 md:mb-1">
                  Menuju <span className="font-bold text-white">{nextPrayerName}</span>
                </p>
                <p className="text-2xl md:text-3xl font-black tracking-tight leading-none">{currentTime || '--:--:--'}</p>
              </div>
              <div className="hidden md:block text-right">
                <span className="font-mono text-xl font-bold bg-black/20 text-emerald-50 px-3 py-1.5 rounded-xl border border-white/10">{countdown}</span>
              </div>
            </div>
          </div>
          
          <p className="text-[9px] text-emerald-100 mt-1 mb-3 md:hidden">
            Menuju <span className="font-semibold text-white">{nextPrayerName}</span>:{' '}
            <span className="font-mono font-bold">{countdown}</span>
          </p>

          <div className="grid grid-cols-5 gap-1.5 md:gap-2 text-center text-[11px] mt-2 md:mt-4">
            {prayerTimes.map((p) => (
              <div key={p.name} className={`rounded-xl p-1.5 md:p-2 transition-colors ${p.name === nextPrayerName ? 'bg-white/20 ring-1 ring-white/40' : 'bg-black/10'}`}>
                <p className="text-[8px] md:text-[9px] font-semibold tracking-wider uppercase text-emerald-100">{p.name}</p>
                <p className="text-xs md:text-sm font-bold mt-0.5">{p.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistik ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <Users size={64} className="absolute -right-4 -bottom-4 text-emerald-50 opacity-40 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Santri</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.total_santri}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 relative overflow-hidden group hover:border-blue-200 transition-colors">
          <Activity size={64} className="absolute -right-4 -bottom-4 text-blue-50 opacity-40 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hadir Hari Ini</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-blue-600">{stats.present_today}</h3>
            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
              {stats.total_santri > 0 ? Math.round((stats.present_today / stats.total_santri) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 relative overflow-hidden group hover:border-amber-200 transition-colors">
          <BookOpen size={64} className="absolute -right-4 -bottom-4 text-amber-50 opacity-40 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Kelompok</p>
          <h3 className="text-3xl font-black text-amber-600">{stats.total_groups || 0}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 relative overflow-hidden group hover:border-purple-200 transition-colors">
          <Users size={64} className="absolute -right-4 -bottom-4 text-purple-50 opacity-40 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Pengajar</p>
          <h3 className="text-3xl font-black text-purple-600">{stats.total_teachers || 0}</h3>
        </div>
      </div>

      {/* Menu utama (Hanya Tampil di Mobile) */}
      <div className="mb-8 md:hidden">
        <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
          Akses Cepat
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dashboardMenu.map(({ icon: Icon, label, page, color }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`${color} border rounded-2xl p-4 text-center shadow-sm active:scale-95 transition-transform`}
            >
              <Icon className="mx-auto mb-2" size={24} />
              <p className="text-[11px] font-bold">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Aktivitas Terakhir — RBAC scoped */}
      <ActivityFeed
        role={role}
        teacherId={currentUser?.id}
        teacherName={currentUser?.name}
        onNavigate={onNavigate}
      />
    </div>
  );
}
