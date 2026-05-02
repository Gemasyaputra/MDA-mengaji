'use client';

import { useEffect, useState } from 'react';
import {
  CheckSquare,
  BookOpen,
  UserPlus,
  Trophy,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface ActivityItem {
  type: 'attendance' | 'learning' | 'new_student' | 'milestone';
  ts: string;
  actor_name: string;
  group_name: string | null;
  student_name: string | null;
  detail: string | null;
  activity_date: string | null;
}

interface ActivityFeedProps {
  role: string | null;
  teacherId?: string | number | null;
  teacherName?: string;
  onNavigate: (page: string) => void;
}

// ──────────────────────────────────────────────
// Helper: format relative time in Bahasa Indonesia
// ──────────────────────────────────────────────
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return 'Baru saja';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ──────────────────────────────────────────────
// Helper: build human-readable sentence
// ──────────────────────────────────────────────
export function buildMessage(
  item: ActivityItem,
  isTeacher: boolean,
): { text: React.ReactNode } {
  const bold = (str: string | null | undefined) =>
    str ? <span className="font-semibold text-slate-800">{str}</span> : null;

  switch (item.type) {
    case 'attendance':
      if (isTeacher) {
        return {
          text: (
            <>Anda menyimpan presensi kehadiran {bold(item.group_name)}.</>
          ),
        };
      }
      return {
        text: (
          <>
            {bold(item.actor_name)} mengisi presensi kehadiran {bold(item.group_name)}.
          </>
        ),
      };

    case 'learning':
      if (isTeacher) {
        return {
          text: (
            <>
              Anda mencatat setoran tilawah santri {bold(item.student_name)} — {bold(item.detail)}.
            </>
          ),
        };
      }
      return {
        text: (
          <>
            {bold(item.actor_name)} mencatat setoran tilawah {bold(item.student_name)}{' '}
            ({bold(item.detail)}) di {bold(item.group_name)}.
          </>
        ),
      };

    case 'new_student':
      if (isTeacher) {
        return {
          text: (
            <>
              Admin menambahkan santri {bold(item.student_name)} ke kelompok Anda ({bold(item.group_name)}).
            </>
          ),
        };
      }
      return {
        text: (
          <>
            Admin mendaftarkan santri baru {bold(item.student_name)} ke kelompok {bold(item.group_name)}.
          </>
        ),
      };

    case 'milestone':
      if (isTeacher) {
        return {
          text: (
            <>
              🎉 Santri {bold(item.student_name)} dari kelompok Anda baru saja{' '}
              <span className="text-amber-600 font-semibold">Khatam Iqro</span> dan naik ke Al-Quran!
            </>
          ),
        };
      }
      return {
        text: (
          <>
            🎉 {bold(item.student_name)} dari {bold(item.group_name)}{' '}
            <span className="text-amber-600 font-semibold">Khatam Iqro</span> dan naik ke Al-Quran!
          </>
        ),
      };

    default:
      return { text: 'Aktivitas tidak diketahui.' };
  }
}

// ──────────────────────────────────────────────
// Icon config per type
// ──────────────────────────────────────────────
export const ICON_CONFIG: Record<
  ActivityItem['type'],
  { icon: React.ElementType; bg: string; text: string }
> = {
  attendance: { icon: CheckSquare, bg: 'bg-blue-50', text: 'text-blue-500' },
  learning:   { icon: BookOpen,    bg: 'bg-purple-50', text: 'text-purple-500' },
  new_student:{ icon: UserPlus,    bg: 'bg-emerald-50', text: 'text-emerald-500' },
  milestone:  { icon: Trophy,      bg: 'bg-amber-50', text: 'text-amber-500' },
};

// ──────────────────────────────────────────────
// Skeleton loader row
// ──────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 p-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-2 bg-slate-100 rounded w-1/4 mt-1" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Component (dashboard preview — limit 5)
// ──────────────────────────────────────────────
export default function ActivityFeed({ role, teacherId, teacherName, onNavigate }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = role === 'teacher';

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (role) params.set('role', role);
        if (isTeacher && teacherId) params.set('teacher_id', String(teacherId));
        params.set('limit', '5');

        const res = await fetch(`/api/dashboard/activity?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setActivities(json.data ?? []);
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoading(false);
      }
    };

    if (role) fetchActivities();
  }, [role, teacherId]);

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
          Aktivitas Terakhir
        </h3>
        {isTeacher && (
          <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Kelompok Anda
          </span>
        )}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-50">
            {[...Array(3)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Activity size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">Belum ada aktivitas terbaru</p>
            <p className="text-xs mt-1 opacity-70">
              Aktivitas akan muncul setelah Anda mulai mengisi data.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-50">
              {activities.map((item, i) => {
                const config = ICON_CONFIG[item.type] ?? ICON_CONFIG['attendance'];
                const Icon = config.icon;
                const { text } = buildMessage(item, isTeacher);
                const timeLabel = item.ts ? formatRelativeTime(item.ts) : '';

                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 hover:bg-slate-50/70 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${config.bg} ${config.text} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={17} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-600 leading-snug">{text}</p>
                      {timeLabel && (
                        <p className="text-[11px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                          {timeLabel}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer — Lihat Semua */}
            <button
              onClick={() => onNavigate('activity-log')}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-[12px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100 group"
            >
              Lihat Semua Aktivitas
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
