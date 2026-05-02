'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CheckSquare,
  BookOpen,
  UserPlus,
  Trophy,
  Activity,
  Filter,
  Search,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import {
  formatRelativeTime,
  buildMessage,
  ICON_CONFIG,
} from '@/components/dashboard/ActivityFeed';

interface ActivityItem {
  type: 'attendance' | 'learning' | 'new_student' | 'milestone';
  ts: string;
  actor_name: string;
  group_name: string | null;
  student_name: string | null;
  detail: string | null;
  activity_date: string | null;
}

interface ActivityLogPageProps {
  role: string | null;
  currentUser: any;
  onNavigate: (page: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  all: 'Semua',
  attendance: 'Presensi',
  learning: 'Setoran Tilawah',
  new_student: 'Santri Baru',
  milestone: 'Pencapaian',
};

const LIMIT_OPTIONS = [20, 50, 100];

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 p-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-slate-100 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-3/5" />
        <div className="h-2 bg-slate-100 rounded w-1/4 mt-1" />
      </div>
    </div>
  );
}

export default function ActivityLogPage({ role, currentUser, onNavigate }: ActivityLogPageProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filtered, setFiltered] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(20);
  const [showLimitMenu, setShowLimitMenu] = useState(false);

  const isTeacher = role === 'teacher';

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      if (isTeacher && currentUser?.id) params.set('teacher_id', String(currentUser.id));
      params.set('limit', String(limit));

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
  }, [role, currentUser?.id, limit]);

  useEffect(() => {
    if (role) fetchActivities();
  }, [fetchActivities]);

  // Apply client-side filter + search
  useEffect(() => {
    let result = activities;

    if (selectedType !== 'all') {
      result = result.filter((a) => a.type === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.actor_name?.toLowerCase().includes(q) ||
          a.student_name?.toLowerCase().includes(q) ||
          a.group_name?.toLowerCase().includes(q) ||
          a.detail?.toLowerCase().includes(q),
      );
    }

    setFiltered(result);
  }, [activities, selectedType, searchQuery]);

  // ──── Date grouping helper ────
  function getDateLabel(isoString: string): string {
    if (!isoString) return 'Tidak diketahui';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Tidak diketahui';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hari Ini';
    if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Group by date
  const groups: { label: string; items: ActivityItem[] }[] = [];
  filtered.forEach((item) => {
    const label = getDateLabel(item.ts);
    const existing = groups.find((g) => g.label === label);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Activity size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Log Aktivitas</h1>
            <p className="text-xs text-slate-500">
              {isTeacher ? 'Aktivitas seputar kelompok yang Anda ajar' : 'Semua aktivitas di MDA Masjid Nurul Huda'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama santri, kelompok, guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400 transition"
          />
        </div>

        {/* Limit selector */}
        <div className="relative">
          <button
            onClick={() => setShowLimitMenu(!showLimitMenu)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-700 hover:border-blue-300 transition"
          >
            <Filter size={14} className="text-slate-400" />
            {limit} item
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showLimitMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {LIMIT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => { setLimit(n); setShowLimitMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition ${limit === n ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'}`}
                >
                  {n} item
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchActivities}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-700 hover:border-blue-300 disabled:opacity-50 transition"
        >
          <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Muat ulang
        </button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedType(key)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${
              selectedType === key
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-slate-400">
          <Activity size={36} className="mb-3 opacity-30" />
          <p className="text-sm font-semibold">Tidak ada aktivitas ditemukan</p>
          <p className="text-xs mt-1 opacity-70">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Date label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] text-slate-400 font-medium">{group.items.length} aktivitas</span>
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {group.items.map((item, i) => {
                  const config = ICON_CONFIG[item.type] ?? ICON_CONFIG['attendance'];
                  const Icon = config.icon;
                  const { text } = buildMessage(item, isTeacher);
                  const timeLabel = item.ts ? formatRelativeTime(item.ts) : '';

                  return (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full ${config.bg} ${config.text} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={17} strokeWidth={2.2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-600 leading-snug">{text}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {timeLabel && (
                            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                              {timeLabel}
                            </p>
                          )}
                          {/* Type badge */}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                            {TYPE_LABELS[item.type] ?? item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Summary footer */}
          <p className="text-center text-[11px] text-slate-400 py-2">
            Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> dari{' '}
            <span className="font-semibold text-slate-600">{activities.length}</span> aktivitas (limit {limit})
          </p>
        </div>
      )}
    </div>
  );
}
