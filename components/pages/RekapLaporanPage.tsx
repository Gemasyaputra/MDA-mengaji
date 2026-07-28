'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'sonner';

interface StudyGroup {
  id: number;
  name: string;
}

interface RekapRow {
  student_id: number;
  student_name: string;
  group_name: string | null;
  hadir: number | string;
  sakit: number | string;
  izin: number | string;
  alpa: number | string;
  total_pertemuan: number | string;
  persentase_hadir: number | string;
  jumlah_tilawah: number | string;
  jumlah_hafalan: number | string;
  jumlah_doa: number | string;
  jumlah_sholat: number | string;
}

function firstDayOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export default function RekapLaporanPage() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [groupId, setGroupId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(firstDayOfMonth());
  const [endDate, setEndDate] = useState<string>(today());
  const [rows, setRows] = useState<RekapRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/study-groups');
        const data = await res.json();
        const list = data.success && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setStudyGroups(list);
      } catch (err) {
        console.error('Gagal memuat kelompok belajar', err);
      }
    };
    fetchGroups();
  }, []);

  const fetchRekap = async () => {
    if (!startDate || !endDate) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      if (groupId) params.set('group_id', groupId);
      const res = await fetch(`/api/rekap?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRows(data.data ?? []);
      } else {
        toast.error(data.error || 'Gagal memuat rekapitulasi');
        setRows([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat rekapitulasi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRekap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, groupId]);

  const groupOptions = useMemo(
    () => [{ value: '', label: 'Semua Kelompok' }, ...studyGroups.map((g) => ({ value: g.id, label: g.name }))],
    [studyGroups],
  );

  const periodeLabel = useMemo(() => {
    const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${fmt(startDate)} - ${fmt(endDate)}`;
  }, [startDate, endDate]);

  const handleDownloadPdf = async () => {
    if (rows.length === 0) {
      toast.error('Tidak ada data untuk diunduh');
      return;
    }
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MDA Masjid Nurul Huda', 14, 15);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Rekapitulasi Kehadiran & Setoran Santri', 14, 22);
      doc.setFontSize(9);
      doc.text(`Periode: ${periodeLabel}`, 14, 28);

      autoTable(doc, {
        startY: 34,
        head: [[
          'Nama Santri', 'Kelompok', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Persentase',
          'Tilawah', 'Hafalan', 'Doa', 'Bacaan Sholat',
        ]],
        body: rows.map((r) => [
          r.student_name,
          r.group_name || '-',
          r.hadir,
          r.sakit,
          r.izin,
          r.alpa,
          `${r.persentase_hadir}%`,
          r.jumlah_tilawah,
          r.jumlah_hafalan,
          r.jumlah_doa,
          r.jumlah_sholat,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [5, 150, 105] },
      });

      doc.save(`rekap-${startDate}_${endDate}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat file PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <FileText className="text-emerald-600" size={22} />
            Rekapitulasi & Laporan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan kehadiran dan setoran santri per periode.
          </p>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={isExporting || rows.length === 0}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-3 rounded-xl shadow-sm transition-colors"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Unduh PDF
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Kelompok Belajar</label>
          <SearchableSelect
            options={groupOptions}
            value={groupId}
            onChange={(v) => setGroupId(String(v))}
            placeholder="Semua Kelompok"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left font-bold px-4 py-3">Nama Santri</th>
              <th className="text-left font-bold px-4 py-3">Kelompok</th>
              <th className="text-center font-bold px-3 py-3">Hadir</th>
              <th className="text-center font-bold px-3 py-3">Sakit</th>
              <th className="text-center font-bold px-3 py-3">Izin</th>
              <th className="text-center font-bold px-3 py-3">Alpa</th>
              <th className="text-center font-bold px-3 py-3">%</th>
              <th className="text-center font-bold px-3 py-3">Tilawah</th>
              <th className="text-center font-bold px-3 py-3">Hafalan</th>
              <th className="text-center font-bold px-3 py-3">Doa</th>
              <th className="text-center font-bold px-3 py-3">Sholat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="text-center py-10 text-slate-400">
                  <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                  Memuat data...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-10 text-slate-400">
                  Tidak ada data pada periode ini.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.student_id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.student_name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.group_name || '-'}</td>
                  <td className="px-3 py-3 text-center text-emerald-600 font-bold">{r.hadir}</td>
                  <td className="px-3 py-3 text-center text-amber-600">{r.sakit}</td>
                  <td className="px-3 py-3 text-center text-blue-600">{r.izin}</td>
                  <td className="px-3 py-3 text-center text-red-600">{r.alpa}</td>
                  <td className="px-3 py-3 text-center font-bold">{r.persentase_hadir}%</td>
                  <td className="px-3 py-3 text-center">{r.jumlah_tilawah}</td>
                  <td className="px-3 py-3 text-center">{r.jumlah_hafalan}</td>
                  <td className="px-3 py-3 text-center">{r.jumlah_doa}</td>
                  <td className="px-3 py-3 text-center">{r.jumlah_sholat}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
