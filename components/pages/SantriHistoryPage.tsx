'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, BookOpen, Filter, X } from 'lucide-react';

interface SantriHistoryPageProps {
  onNavigate: (page: string) => void;
  santriId?: string | null;
  mode?: string | null; // 'learning' | 'worship'
  returnPath?: string | null;
}

interface SantriData {
  id: number;
  name: string;
  current_level?: string;
}

interface LearningRecord {
  id: number;
  date: string;
  type: string;
  level_or_surah?: string;
  start_point?: string;
  end_point?: string;
  quality: string;
  teacher_name?: string;
  notes?: string;
  // Worship specific fields
  daily_prayer_title?: string;
  prayer_reading_title?: string;
  is_completed?: boolean;
}

export default function SantriHistoryPage({ onNavigate, santriId, mode = 'learning', returnPath }: SantriHistoryPageProps) {
  const [santri, setSantri] = useState<SantriData | null>(null);
  const [history, setHistory] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Date filter state
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const isWorship = mode === 'worship';

  useEffect(() => {
    if (!santriId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Santri Info
        const resSantri = await fetch(`/api/students?id=${santriId}`);
        const jsonSantri = await resSantri.json();
        if (jsonSantri.success && jsonSantri.data) {
          setSantri(jsonSantri.data);
        }

        // Fetch Full History based on mode
        const endpoint = isWorship
            ? `/api/worship-records?student_id=${santriId}&limit=200`
            : `/api/learning-records?student_id=${santriId}&limit=200`;

        const resHistory = await fetch(endpoint);
        const jsonHistory = await resHistory.json();

        if (jsonHistory.success && Array.isArray(jsonHistory.data)) {
          setHistory(jsonHistory.data);
        } else if (Array.isArray(jsonHistory.data)) {
            setHistory(jsonHistory.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [santriId, mode]);

  // Client-side date filtering
  const filteredHistory = useMemo(() => {
    return history.filter(record => {
      const recDate = record.date?.split('T')[0] ?? '';
      if (filterFrom && recDate < filterFrom) return false;
      if (filterTo && recDate > filterTo) return false;
      return true;
    });
  }, [history, filterFrom, filterTo]);

  const hasFilter = filterFrom !== '' || filterTo !== '';

  const resetFilter = () => {
    setFilterFrom('');
    setFilterTo('');
  };

  const formatDate = (dateStr: string) => {
    try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
  };

  const qualityColor = (q: string) => {
    if (q === 'A') return 'bg-emerald-100 text-emerald-700';
    if (q === 'B') return 'bg-blue-100 text-blue-700';
    if (q === 'C') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) {
    return (
      <div className="p-4 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
              if (returnPath) {
                  onNavigate(returnPath);
              } else {
                  onNavigate(isWorship ? 'input-hafalan-doa' : 'input-iqro')
              }
          }}
          className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-emerald-600 border border-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-slate-800">
            {isWorship ? 'Riwayat Hafalan' : 'Riwayat Mengaji'}
          </h1>
          <p className="text-xs text-slate-500">{santri?.name}</p>
        </div>
        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilter(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            hasFilter
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-violet-400'
          }`}
        >
          <Filter size={13} />
          Filter
          {hasFilter && <span className="bg-white/30 rounded-full px-1">aktif</span>}
        </button>
      </div>

      {/* Date Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={13} /> Filter Tanggal
            </p>
            {hasFilter && (
              <button
                onClick={resetFilter}
                className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X size={11} /> Reset
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Dari</label>
              <input
                type="date"
                value={filterFrom}
                onChange={e => setFilterFrom(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-violet-400 bg-slate-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Sampai</label>
              <input
                type="date"
                value={filterTo}
                onChange={e => setFilterTo(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-violet-400 bg-slate-50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className={`${isWorship ? 'bg-purple-600' : 'bg-emerald-600'} text-white p-5 rounded-2xl shadow-lg mb-6 relative overflow-hidden`}>
        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6"></div>
        <div className="relative z-10 flex justify-between items-center">
            <div>
                <p className={`${isWorship ? 'text-purple-100' : 'text-emerald-100'} text-xs font-medium mb-1`}>
                    Total {isWorship ? 'Hafalan Doa' : 'Setoran'}
                    {hasFilter && <span className="ml-1 opacity-75">(difilter)</span>}
                </p>
                <h2 className="text-3xl font-bold">{filteredHistory.length}</h2>
                {hasFilter && filteredHistory.length !== history.length && (
                  <p className="text-[11px] opacity-60 mt-0.5">dari {history.length} total</p>
                )}
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-white" />
            </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <span className={`w-1 h-5 ${isWorship ? 'bg-purple-500' : 'bg-emerald-500'} rounded-full`}></span>
              {hasFilter ? 'Hasil Filter' : 'Semua Riwayat'}
          </h3>
          {hasFilter && (
            <span className="text-[11px] text-slate-400">
              {filteredHistory.length} dari {history.length} data
            </span>
          )}
        </div>

        {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-100">
                {hasFilter ? 'Tidak ada riwayat pada rentang tanggal ini.' : 'Belum ada riwayat.'}
            </div>
        ) : (
            <div className="space-y-3">
                {filteredHistory.map((record) => (
                    <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <Calendar size={14} />
                                {formatDate(record.date)}
                             </div>
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${qualityColor(record.quality)}`}>
                                Nilai: {record.quality}
                             </span>
                        </div>

                        <div className={`pl-1 border-l-2 ${isWorship ? 'border-purple-100' : 'border-emerald-100'}`}>
                            {isWorship ? (
                                <>
                                    <h4 className="font-bold text-slate-800 text-lg ml-2">
                                        {record.type === 'DOA_HARIAN' ? record.daily_prayer_title : record.prayer_reading_title}
                                    </h4>
                                    <div className="ml-2 mt-1 flex gap-2">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                            {record.type === 'DOA_HARIAN' ? 'Doa Harian' : 'Bacaan Sholat'}
                                        </span>
                                        {record.is_completed && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold">
                                                ✓ Lulus
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h4 className="font-bold text-slate-800 text-lg ml-2">{record.level_or_surah}</h4>
                                    <p className="text-sm text-slate-600 ml-2">
                                        {record.start_point && record.end_point
                                            ? record.type === 'IQRO'
                                                ? `Halaman ${record.start_point} - ${record.end_point}`
                                                : `Ayat ${record.start_point} - ${record.end_point}`
                                            : ''
                                        }
                                    </p>
                                </>
                            )}
                        </div>

                        {record.notes && (
                            <div className="mt-3 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 italic">
                                "{record.notes}"
                            </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                             <span className="text-[10px] text-slate-400">
                                Pengajar: {record.teacher_name || 'Admin'}
                             </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
