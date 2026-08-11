'use client';
import { useEffect, useState } from 'react';
import { User } from '@/types';

interface PengumumanPageProps {
  onNavigate?: (pageId: string) => void;
  currentUser?: User | null;
}

export default function PengumumanPage({ onNavigate, currentUser }: PengumumanPageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/pengumuman')
      .then(r => r.json())
      .then(json => setItems(json.data ?? []))  // unwrap .data — lihat catatan di bawah
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setEditingId(null); setJudul(''); setIsi(''); };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setJudul(item.judul ?? '');
    setIsi(item.isi ?? '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/pengumuman/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, isi }),
      });
    } else {
      await fetch('/api/pengumuman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, isi }),
      });
    }
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus item ini?')) return;
    await fetch(`/api/pengumuman/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pengumuman</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input value={judul} onChange={e => setJudul(e.target.value)}
          placeholder="Judul" className="border rounded px-3 py-2" />
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-bold">
          {editingId ? 'Simpan Perubahan' : 'Tambah'}
        </button>
        {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 rounded-full text-sm font-bold border">Batal</button>}
      </form>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <table className="w-full">
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.judul}</td>
                <td className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}