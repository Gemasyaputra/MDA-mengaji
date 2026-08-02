'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Book, Sparkles, ChevronDown, ChevronUp, Upload, FileText, Link as LinkIcon } from 'lucide-react';
import DeleteModal from '@/components/DeleteModal';
import { toast } from 'sonner';

// Data lama sebelum lampiran diganti ke gambar mungkin masih menyimpan URL PDF asli —
// deteksi lewat ekstensi supaya tetap dibuka sebagai link, bukan dipaksa <img> yang gagal render.
const isPdfUrl = (url: string) => /\.pdf($|\?)/i.test(url);

interface MasterHafalanPageProps {
  onNavigate: (page: string) => void;
  currentUser?: any;
}

interface MasterData {
  id: number;
  title: string;
  category?: string;
  arabic_text?: string;
  latin_text?: string;
  translation?: string;
  step_order?: number; // Only for prayer readings
  pdf_url?: string;
  external_link?: string;
}

export default function MasterHafalanPage({ onNavigate, currentUser }: MasterHafalanPageProps) {
  const [activeTab, setActiveTab] = useState<'daily-prayers' | 'prayer-readings'>('daily-prayers');
  const [data, setData] = useState<MasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterData | null>(null);
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0, title: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
      title: '',
      category: '',
      arabic_text: '',
      latin_text: '', // Only for daily prayers
      translation: '',
      step_order: '', // Only for prayer readings
      pdf_url: '',
      external_link: '',
  });
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm });
      const json = await res.json();
      if (json.success) {
        setFormData(prev => ({ ...prev, pdf_url: json.url }));
      } else {
        toast.error(json.error || 'Gagal mengunggah PDF');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah PDF');
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'daily-prayers' ? 'daily-prayers' : 'prayer-readings';
      const res = await fetch(`/api/master/${endpoint}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDelete = (id: number, title: string) => {
    setDeleteModal({ isOpen: true, id, title });
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
        const endpoint = activeTab === 'daily-prayers' ? 'daily-prayers' : 'prayer-readings';
        const res = await fetch(`/api/master/${endpoint}?id=${deleteModal.id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            fetchData();
            setDeleteModal({ isOpen: false, id: 0, title: '' });
        } else {
            toast.error('Gagal menghapus');
        }
    } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan');
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const endpoint = activeTab === 'daily-prayers' ? 'daily-prayers' : 'prayer-readings';
        const method = editingItem ? 'PUT' : 'POST';
        const payload: any = {
            title: formData.title,
            category: formData.category,
            arabic_text: formData.arabic_text,
            translation: formData.translation,
            pdf_url: formData.pdf_url,
            external_link: formData.external_link,
        };
        
        if (activeTab === 'daily-prayers') {
            payload.latin_text = formData.latin_text;
        }

        if (activeTab === 'prayer-readings') {
            payload.step_order = Number(formData.step_order);
        }

        if (editingItem) {
            payload.id = editingItem.id;
        }

        const res = await fetch(`/api/master/${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const json = await res.json();
        if (json.success) {
            setShowModal(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } else {
            toast.error(json.error || 'Gagal menyimpan');
        }

      } catch (err) {
          console.error(err);
          toast.error('Terjadi kesalahan');
      }
  };

  const resetForm = () => {
      setFormData({
          title: '',
          category: '',
          arabic_text: '',
          latin_text: '',
          translation: '',
          step_order: '',
          pdf_url: '',
          external_link: '',
      });
  };

  const openEdit = (item: MasterData) => {
      setEditingItem(item);
      setFormData({
          title: item.title,
          category: item.category || '',
          arabic_text: item.arabic_text || '',
          latin_text: item.latin_text || '',
          translation: item.translation || '',
          step_order: item.step_order ? String(item.step_order) : '',
          pdf_url: item.pdf_url || '',
          external_link: item.external_link || '',
      });
      setShowModal(true);
  };

  const openAdd = () => {
      setEditingItem(null);
      resetForm();
      setShowModal(true);
  };

  const filteredData = data.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-4 p-4">
            <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-700">
                <ArrowLeft size={24} />
            </button>
            <h1 className="font-bold text-lg text-slate-800">Bank Materi</h1>
        </div>
        <div className="flex border-b border-slate-200 px-4">
            <button 
                onClick={() => setActiveTab('daily-prayers')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'daily-prayers' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}
            >
                Doa Harian
            </button>
            <button 
                onClick={() => setActiveTab('prayer-readings')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'prayer-readings' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}
            >
                Bacaan Sholat
            </button>
        </div>
      </div>

      <div className="p-4">
          <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
              </div>
              <button 
                onClick={openAdd}
                className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                  <Plus size={24} />
              </button>
          </div>

          {loading ? (
             <div className="text-center py-10 text-slate-400">Memuat data...</div>
          ) : (
              <div className="space-y-3">
                  {filteredData.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 italic">Tidak ada data ditemukan.</div>
                  ) : (
                      filteredData.map(item => (
                          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm group">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeTab === 'daily-prayers' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                          {activeTab === 'daily-prayers' ? <Sparkles size={18} /> : <Book size={18} />}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                                           <div className="flex gap-2 mt-1">
                                             {item.category && (
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{item.category}</span>
                                             )}
                                             {item.step_order !== undefined && (
                                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">Urutan: {item.step_order}</span>
                                             )}
                                           </div>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                          <Edit2 size={16} />
                                      </button>
                                      <button onClick={() => handleDelete(item.id, item.title)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </div>

                              {/* Preview Text */}
                              {(item.arabic_text || item.translation || item.pdf_url || item.external_link) && (
                                  <div className="mt-3 pt-3 border-t border-slate-50 text-xs space-y-2">
                                      {item.arabic_text && <p className="font-arabic text-right text-lg leading-loose text-slate-700">{item.arabic_text}</p>}
                                      {item.latin_text && <p className="text-emerald-600 italic">{item.latin_text}</p>}
                                      {item.translation && <p className="text-slate-500">"{item.translation}"</p>}
                                      {item.pdf_url && isPdfUrl(item.pdf_url) && (
                                          <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 font-semibold hover:underline">
                                              <FileText size={12} /> Lihat PDF
                                          </a>
                                      )}
                                      {item.pdf_url && !isPdfUrl(item.pdf_url) && (
                                          <img
                                            src={item.pdf_url}
                                            alt={`Materi - ${item.title}`}
                                            className="max-h-64 w-auto rounded-lg border border-slate-200 object-contain"
                                          />
                                      )}
                                      {item.external_link && (
                                          <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 font-semibold hover:underline">
                                              <LinkIcon size={12} /> Link Materi
                                          </a>
                                      )}
                                  </div>
                              )}
                          </div>
                      ))
                  )}
              </div>
          )}
      </div>

      {/* Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                  <h2 className="font-bold text-lg mb-4">{editingItem ? 'Edit Data' : 'Tambah Data'}</h2>
                  <form onSubmit={handleSave} className="space-y-4">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">JUDUL</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                placeholder="Contoh: Doa Sebelum Tidur"
                            />
                        </div>

                         <div className={activeTab === 'prayer-readings' ? '' : 'col-span-2'}>
                            <label className="block text-xs font-bold text-slate-500 mb-1">KATEGORI</label>
                            <input 
                                type="text" 
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                placeholder={activeTab === 'daily-prayers' ? "Contoh: Adab Makan" : "Contoh: Rukun"}
                            />
                        </div>
                      
                        {activeTab === 'prayer-readings' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">URUTAN</label>
                                <input
                                    type="number"
                                    value={formData.step_order}
                                    onChange={(e) => setFormData(prev => ({ ...prev, step_order: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                    placeholder="1"
                                />
                            </div>
                        )}
                      </div>

                      {!editingItem && data.length > 0 && (
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">MULAI DARI MATERI YANG SUDAH ADA (opsional)</label>
                              <select
                                onChange={(e) => {
                                    const source = data.find(d => String(d.id) === e.target.value);
                                    if (!source) return;
                                    setFormData(prev => ({
                                        ...prev,
                                        arabic_text: source.arabic_text || '',
                                        latin_text: source.latin_text || '',
                                        translation: source.translation || '',
                                        pdf_url: source.pdf_url || '',
                                        external_link: source.external_link || '',
                                    }));
                                    e.target.value = '';
                                }}
                                defaultValue=""
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                              >
                                  <option value="" disabled>Pilih materi untuk disalin isinya, lalu sesuaikan...</option>
                                  {data.map(d => (
                                      <option key={d.id} value={d.id}>{d.title}</option>
                                  ))}
                              </select>
                          </div>
                      )}

                      <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-500">KONTEN MATERI (tampil untuk orang tua &amp; santri)</p>

                          <div>
                              {formData.arabic_text && (
                                  <p dir="rtl" className="font-arabic text-2xl leading-loose text-slate-800 p-2 mb-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                      {formData.arabic_text}
                                  </p>
                              )}
                              <label className="block text-xs font-bold text-slate-500 mb-1">ARAB</label>
                              <textarea
                                dir="rtl"
                                value={formData.arabic_text}
                                onChange={(e) => setFormData(prev => ({ ...prev, arabic_text: e.target.value }))}
                                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-32 resize-none font-arabic text-xl"
                                placeholder="Teks Arab... (bisa juga tempel dari sumber lain)"
                              />
                          </div>

                          {activeTab === 'daily-prayers' && (
                               <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">LATIN</label>
                                <textarea
                                    value={formData.latin_text}
                                    onChange={(e) => setFormData(prev => ({ ...prev, latin_text: e.target.value }))}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-16 resize-none"
                                    placeholder="Teks Latin..."
                                />
                            </div>
                          )}

                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">TERJEMAHAN</label>
                              <textarea
                                value={formData.translation}
                                onChange={(e) => setFormData(prev => ({ ...prev, translation: e.target.value }))}
                                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-20 resize-none"
                                placeholder="Terjemahan..."
                              />
                          </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                          <p className="text-xs font-bold text-slate-500">LAMPIRAN OPSIONAL (Gambar / Link)</p>
                          <p className="text-xs text-slate-400 -mt-2">Pelengkap, bukan pengganti — konten di atas yang akan tampil ke orang tua.</p>
                          <div className="flex items-center gap-2 flex-wrap">
                              <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer transition-colors">
                                  <Upload size={14} />
                                  {isUploadingPdf ? 'Mengunggah...' : 'Unggah Gambar Materi'}
                                  <input type="file" accept="image/*" className="hidden" onChange={handlePdfUpload} disabled={isUploadingPdf} />
                              </label>
                              {formData.pdf_url && isPdfUrl(formData.pdf_url) && (
                                  <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline">
                                      <FileText size={14} /> Lihat PDF
                                  </a>
                              )}
                              {formData.pdf_url && !isPdfUrl(formData.pdf_url) && (
                                  <img src={formData.pdf_url} alt="Preview lampiran" className="h-20 w-auto rounded border border-slate-200 object-contain" />
                              )}
                          </div>
                          <div className="relative">
                              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="url"
                                value={formData.external_link}
                                onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                                className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="https://... (link materi, opsional)"
                              />
                          </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200">
                              Batal
                          </button>
                          <button type="submit" className="flex-1 py-2 text-white font-bold bg-emerald-600 rounded-lg hover:bg-emerald-700">
                              Simpan
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}


      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0, title: '' })}
        onConfirm={executeDelete}
        title="Hapus Data?"
        message={
          <>
            Anda yakin ingin menghapus data <span className="font-bold text-slate-800">"{deleteModal.title}"</span>? 
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
