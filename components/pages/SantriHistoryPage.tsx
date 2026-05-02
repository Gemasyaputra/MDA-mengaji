'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, BookOpen, Filter, X, Edit2, Trash2, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SantriHistoryPageProps {
  onNavigate: (page: string) => void;
  santriId?: string | null;
  mode?: string | null;
  returnPath?: string | null;
}

interface SantriData {
  id: number;
  name: string;
  current_level?: string;
  reading_level?: string;
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
  daily_prayer_id?: number;
  prayer_reading_id?: number;
  daily_prayer_title?: string;
  prayer_reading_title?: string;
  is_completed?: boolean;
}

interface SurahMaster {
  id: number;
  name: string;
  total_verses: number;
}

export default function SantriHistoryPage({ onNavigate, santriId, mode = 'learning', returnPath }: SantriHistoryPageProps) {
  const [santri, setSantri] = useState<SantriData | null>(null);
  const [history, setHistory] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [surahsData, setSurahsData] = useState<SurahMaster[]>([]);
  const [dailyPrayers, setDailyPrayers] = useState<{ id: number; title: string }[]>([]);
  const [prayerReadings, setPrayerReadings] = useState<{ id: number; title: string }[]>([]);

  // Filters
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Edit state (learning)
  const [editRecord, setEditRecord] = useState<LearningRecord | null>(null);
  const [editForm, setEditForm] = useState({ level_or_surah: '', start_point: '', end_point: '', quality: 'A', notes: '' });
  const [editMaxVerse, setEditMaxVerse] = useState<number | null>(null);
  // Edit state (worship)
  const [editWorshipRecord, setEditWorshipRecord] = useState<LearningRecord | null>(null);
  const [editWorshipForm, setEditWorshipForm] = useState({ daily_prayer_id: '', prayer_reading_id: '', quality: 'A', is_completed: false });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isWorship = mode === 'worship';

  useEffect(() => {
    if (!santriId) { setLoading(false); return; }
    const run = async () => {
      try {
        const [resSantri, resHistory] = await Promise.all([
          fetch(`/api/students?id=${santriId}`),
          fetch(isWorship
            ? `/api/worship-records?student_id=${santriId}&limit=200`
            : `/api/learning-records?student_id=${santriId}&limit=200`
          ),
        ]);
        const [jSantri, jHistory] = await Promise.all([resSantri.json(), resHistory.json()]);
        if (jSantri.success && jSantri.data) setSantri(jSantri.data);
        if (jHistory.success && Array.isArray(jHistory.data)) setHistory(jHistory.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    run();
  }, [santriId, mode]);

  // Fetch master data for edit
  useEffect(() => {
    if (isWorship) {
      Promise.all([
        fetch('/api/master-data?type=daily-prayers').then(r => r.json()),
        fetch('/api/master-data?type=prayer-readings').then(r => r.json()),
      ]).then(([jDoa, jBacaan]) => {
        if (jDoa.success) setDailyPrayers(jDoa.data || []);
        if (jBacaan.success) setPrayerReadings(jBacaan.data || []);
      }).catch(() => {});
    } else {
      fetch('/api/master-data?type=surahs').then(r => r.json()).then(j => {
        if (j.success && Array.isArray(j.data))
          setSurahsData(j.data.map((s: any) => ({ id: s.id, name: s.name_latin, total_verses: Number(s.total_verses) })));
      }).catch(() => {});
    }
  }, [isWorship]);

  const filteredHistory = useMemo(() => {
    return history.filter(r => {
      const d = r.date?.split('T')[0] ?? '';
      if (filterFrom && d < filterFrom) return false;
      if (filterTo && d > filterTo) return false;
      return true;
    });
  }, [history, filterFrom, filterTo]);

  const hasFilter = filterFrom !== '' || filterTo !== '';

  // ── Edit handlers ───────────────────────────────────────────
  const openEdit = (rec: LearningRecord) => {
    setEditRecord(rec);
    setEditForm({
      level_or_surah: rec.level_or_surah || '',
      start_point: rec.start_point || '',
      end_point: rec.end_point || '',
      quality: rec.quality || 'A',
      notes: rec.notes || '',
    });
    // Set maxVerse for QURAN records
    if (rec.type === 'QURAN' && rec.level_or_surah) {
      const found = surahsData.find(s => s.name.toLowerCase() === rec.level_or_surah!.toLowerCase());
      setEditMaxVerse(found ? found.total_verses : null);
    } else {
      setEditMaxVerse(null);
    }
  };

  const handleEditSurahChange = (name: string) => {
    const found = surahsData.find(s => s.name.toLowerCase() === name.toLowerCase());
    setEditMaxVerse(found ? found.total_verses : null);
    setEditForm(prev => ({ ...prev, level_or_surah: name, end_point: '' }));
  };

  const handleSaveEdit = async () => {
    if (!editRecord) return;
    if (editRecord.type === 'QURAN' && editMaxVerse !== null) {
      const ep = parseInt(editForm.end_point), sp = parseInt(editForm.start_point);
      if (!isNaN(ep) && ep > editMaxVerse) { toast.error(`Maks ayat: ${editMaxVerse}`); return; }
      if (!isNaN(sp) && !isNaN(ep) && ep < sp) { toast.error('Ayat akhir < ayat mulai'); return; }
    }
    setSaving(true);
    try {
      const res = await fetch('/api/learning-records', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editRecord.id, ...editForm }),
      });
      const json = await res.json();
      if (json.success) {
        setHistory(prev => prev.map(r => r.id === editRecord.id ? { ...r, ...editForm } : r));
        toast.success('Setoran diperbarui'); setEditRecord(null);
      } else toast.error(json.error || 'Gagal menyimpan');
    } catch { toast.error('Terjadi kesalahan'); }
    finally { setSaving(false); }
  };

  const openEditWorship = (rec: LearningRecord) => {
    setEditWorshipRecord(rec);
    setEditWorshipForm({
      daily_prayer_id: String(rec.daily_prayer_id ?? ''),
      prayer_reading_id: String(rec.prayer_reading_id ?? ''),
      quality: rec.quality || 'A',
      is_completed: rec.is_completed ?? false,
    });
  };

  const handleSaveWorshipEdit = async () => {
    if (!editWorshipRecord) return;
    setSaving(true);
    try {
      const payload: any = { id: editWorshipRecord.id, quality: editWorshipForm.quality, is_completed: editWorshipForm.is_completed };
      if (editWorshipRecord.type === 'DOA_HARIAN') payload.daily_prayer_id = Number(editWorshipForm.daily_prayer_id);
      else payload.prayer_reading_id = Number(editWorshipForm.prayer_reading_id);
      const res = await fetch('/api/worship-records', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh title from master data
        const dp = dailyPrayers.find(d => d.id === Number(editWorshipForm.daily_prayer_id));
        const pr = prayerReadings.find(p => p.id === Number(editWorshipForm.prayer_reading_id));
        setHistory(prev => prev.map(r => r.id === editWorshipRecord.id ? {
          ...r, quality: editWorshipForm.quality, is_completed: editWorshipForm.is_completed,
          daily_prayer_title: dp?.title ?? r.daily_prayer_title,
          prayer_reading_title: pr?.title ?? r.prayer_reading_title,
        } : r));
        toast.success('Hafalan diperbarui'); setEditWorshipRecord(null);
      } else toast.error(json.error || 'Gagal menyimpan');
    } catch { toast.error('Terjadi kesalahan'); }
    finally { setSaving(false); }
  };

  // ── Delete handlers ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const endpoint = isWorship ? `/api/worship-records?id=${deleteId}` : `/api/learning-records?id=${deleteId}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setHistory(prev => prev.filter(r => r.id !== deleteId));
        toast.success('Data dihapus'); setDeleteId(null);
      } else toast.error(json.error || 'Gagal menghapus');
    } catch { toast.error('Terjadi kesalahan'); }
    finally { setDeleting(false); }
  };

  const formatDate = (d: string) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  const qualityColor = (q: string) => {
    if (q === 'A') return 'bg-emerald-100 text-emerald-700';
    if (q === 'B') return 'bg-blue-100 text-blue-700';
    if (q === 'C') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) return (
    <div className="p-4 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Memuat riwayat...</p>
    </div>
  );

  const jilids = [1,2,3,4,5,6].map(i => `Jilid ${i}`);

  return (
    <div className="p-4 pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => returnPath ? onNavigate(returnPath) : onNavigate(isWorship ? 'input-hafalan-doa' : 'input-iqro')}
          className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-emerald-600 border border-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-slate-800">{isWorship ? 'Riwayat Hafalan' : 'Riwayat Mengaji'}</h1>
          <p className="text-xs text-slate-500">{santri?.name}</p>
        </div>
        <button
          onClick={() => setShowFilter(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            hasFilter ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-400'
          }`}
        >
          <Filter size={13} /> Filter{hasFilter && <span className="bg-white/30 rounded-full px-1">aktif</span>}
        </button>
      </div>

      {/* Date Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5"><Calendar size={13} /> Filter Tanggal</p>
            {hasFilter && <button onClick={() => { setFilterFrom(''); setFilterTo(''); }} className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1"><X size={11} /> Reset</button>}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Dari</label>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-violet-400 bg-slate-50" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Sampai</label>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-violet-400 bg-slate-50" />
            </div>
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className={`${isWorship ? 'bg-purple-600' : 'bg-emerald-600'} text-white p-5 rounded-2xl shadow-lg mb-6 relative overflow-hidden`}>
        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className={`${isWorship ? 'text-purple-100' : 'text-emerald-100'} text-xs font-medium mb-1`}>
              Total {isWorship ? 'Hafalan' : 'Setoran'}{hasFilter && <span className="ml-1 opacity-75">(difilter)</span>}
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
            <span className={`w-1 h-5 ${isWorship ? 'bg-purple-500' : 'bg-emerald-500'} rounded-full`} />
            {hasFilter ? 'Hasil Filter' : 'Semua Riwayat'}
          </h3>
          {hasFilter && <span className="text-[11px] text-slate-400">{filteredHistory.length} dari {history.length} data</span>}
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${qualityColor(record.quality)}`}>
                      {record.quality}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => isWorship ? openEditWorship(record) : openEdit(record)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(record.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`pl-1 border-l-2 ${isWorship ? 'border-purple-100' : 'border-emerald-100'}`}>
                  {isWorship ? (
                    <>
                      <h4 className="font-bold text-slate-800 text-base ml-2">
                        {record.type === 'DOA_HARIAN' ? record.daily_prayer_title : record.prayer_reading_title}
                      </h4>
                      <div className="ml-2 mt-1 flex gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {record.type === 'DOA_HARIAN' ? 'Doa Harian' : 'Bacaan Sholat'}
                        </span>
                        {record.is_completed && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold">✓ Lulus</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-bold text-slate-800 text-base ml-2">{record.level_or_surah}</h4>
                      <p className="text-sm text-slate-600 ml-2">
                        {record.start_point && record.end_point
                          ? record.type === 'IQRO'
                            ? `Halaman ${record.start_point} – ${record.end_point}`
                            : `Ayat ${record.start_point} – ${record.end_point}`
                          : ''}
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
                  <span className="text-[10px] text-slate-400">Pengajar: {record.teacher_name || 'Admin'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ─────────────────────────────────────── */}
      {editRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Setoran</h3>
              <button onClick={() => setEditRecord(null)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Level / Surah */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  {editRecord.type === 'IQRO' ? 'Jilid' : 'Surah'}
                </label>
                {editRecord.type === 'IQRO' ? (
                  <select
                    value={editForm.level_or_surah}
                    onChange={e => setEditForm(prev => ({ ...prev, level_or_surah: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {jilids.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                ) : (
                  <select
                    value={editForm.level_or_surah}
                    onChange={e => handleEditSurahChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {surahsData.map((s, idx) => (
                      <option key={s.id} value={s.name}>{idx + 1}. {s.name}</option>
                    ))}
                  </select>
                )}
                {editMaxVerse !== null && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1 mt-2 flex items-center gap-1">
                    📖 Surah ini memiliki <span className="font-bold ml-1">{editMaxVerse} ayat</span>
                  </p>
                )}
              </div>

              {/* Start / End */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                    {editRecord.type === 'IQRO' ? 'Hal. Mulai' : 'Ayat Mulai'}
                  </label>
                  <input
                    type="number" min={1}
                    value={editForm.start_point}
                    onChange={e => setEditForm(prev => ({ ...prev, start_point: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                    Sampai{editMaxVerse !== null && <span className="ml-1 font-normal text-slate-400 normal-case">maks.{editMaxVerse}</span>}
                  </label>
                  <input
                    type="number" min={1}
                    max={editMaxVerse ?? undefined}
                    value={editForm.end_point}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (editMaxVerse !== null && !isNaN(val) && val > editMaxVerse) {
                        setEditForm(prev => ({ ...prev, end_point: String(editMaxVerse) }));
                        toast.error(`Maksimal ayat surah ini adalah ${editMaxVerse}`);
                      } else {
                        setEditForm(prev => ({ ...prev, end_point: e.target.value }));
                      }
                    }}
                    className={`w-full p-3 rounded-lg border text-sm focus:outline-none transition-colors ${
                      editMaxVerse !== null && parseInt(editForm.end_point) > editMaxVerse
                        ? 'border-red-400 bg-red-50'
                        : 'bg-slate-50 border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Kualitas Bacaan</label>
                <div className="flex gap-2">
                  {['A','B','C','D'].map(q => (
                    <button
                      key={q}
                      onClick={() => setEditForm(prev => ({ ...prev, quality: q }))}
                      className={`flex-1 py-3 rounded-lg font-bold border transition ${
                        editForm.quality === q
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >{q}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Catatan</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan perkembangan..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20 resize-none focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setEditRecord(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WORSHIP EDIT MODAL ──────────────────────────────── */}
      {editWorshipRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Hafalan Doa</h3>
              <button onClick={() => setEditWorshipRecord(null)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Item selector */}
              {editWorshipRecord.type === 'DOA_HARIAN' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Doa Harian</label>
                  <select
                    value={editWorshipForm.daily_prayer_id}
                    onChange={e => setEditWorshipForm(p => ({ ...p, daily_prayer_id: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  >
                    {dailyPrayers.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Bacaan Sholat</label>
                  <select
                    value={editWorshipForm.prayer_reading_id}
                    onChange={e => setEditWorshipForm(p => ({ ...p, prayer_reading_id: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  >
                    {prayerReadings.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
              )}
              {/* Status lulus */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Status</label>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)}
                      onClick={() => setEditWorshipForm(p => ({ ...p, is_completed: v }))}
                      className={`flex-1 py-3 rounded-lg font-semibold border text-sm transition ${
                        editWorshipForm.is_completed === v
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}>
                      {v ? '✓ Lulus' : '✗ Belum Lulus'}
                    </button>
                  ))}
                </div>
              </div>
              {/* Kualitas */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Kualitas</label>
                <div className="flex gap-2">
                  {['A','B','C','D'].map(q => (
                    <button key={q}
                      onClick={() => setEditWorshipForm(p => ({ ...p, quality: q }))}
                      className={`flex-1 py-3 rounded-lg font-bold border transition ${
                        editWorshipForm.quality === q
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}>{q}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setEditWorshipRecord(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl">
                Batal
              </button>
              <button onClick={handleSaveWorshipEdit} disabled={saving}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ───────────────────────────── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Setoran?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Data setoran ini akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
