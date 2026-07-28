'use client';

import { Plus, Mail, Phone, Trash2, Edit2, Save, X, Loader2, Upload, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import DeleteModal from '@/components/DeleteModal';
import { toast } from 'sonner';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  jenis_kelamin?: string;
  alamat?: string;
  photo_url?: string;
}

interface ManageTeachersPageProps {
  onNavigate: (page: string) => void;
  currentUser?: any;
}

export default function ManageTeachersPage({ onNavigate, currentUser }: ManageTeachersPageProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    email: '',
    phone: '',
    jenis_kelamin: '',
    alamat: '',
    photo_url: '',
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm });
      const json = await res.json();
      if (json.success) {
        setFormData(prev => ({ ...prev, photo_url: json.url }));
      } else {
        toast.error(json.error || 'Gagal mengunggah foto');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah foto');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Fetch Teachers
  const fetchTeachers = async () => {
      
      try {
          const res = await fetch(`/api/teachers`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
              setTeachers(json.data);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentUser]);

  const handleOpenAdd = () => {
      setIsEditing(false);
      setFormData({ name: '', email: '', phone: '', jenis_kelamin: '', alamat: '', photo_url: '' });
      setShowModal(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
      setIsEditing(true);
      setCurrentTeacherId(teacher.id);
      setFormData({
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || '',
          jenis_kelamin: teacher.jenis_kelamin || '',
          alamat: teacher.alamat || '',
          photo_url: teacher.photo_url || ''
      });
      setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;

    try {
        const url = isEditing ? '/api/teachers' : '/api/teachers';
        const method = isEditing ? 'PUT' : 'POST';
        
        const payload: any = {
            ...formData
        };
        
        if (isEditing && currentTeacherId) {
            payload.id = currentTeacherId;
        }

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();

        if (json.success) {
            setShowModal(false);
            fetchTeachers();
            setFormData({ name: '', email: '', phone: '' });
        } else {
            toast.error(json.error || 'Gagal menyimpan data');
        }

    } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan sistem');
    }
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

    const executeDelete = async () => {
    if(!deleteModal.id) return;
    setIsDeleting(true);
    try {
        const res = await fetch(`/api/teachers?id=${deleteModal.id}`, { method: 'DELETE' });
        const json = await res.json();
        if(json.success) {
            fetchTeachers();
            setDeleteModal({ isOpen: false, id: 0, name: '' });
        } else {
            toast.error(json.error || 'Gagal menghapus');
        }
    } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan');
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Data Guru</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

        {loading ? (
            <div className="text-center text-slate-500 py-10">Memuat data guru...</div>
        ) : (
          /* Teachers List */
          <div className="space-y-3">
            {teachers.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-500 text-sm">
                    Belum ada data guru.
                </div>
            ) : (
                teachers.map(teacher => (
                <div key={teacher.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="mb-3 flex items-center gap-3">
                    {teacher.photo_url ? (
                      <img src={teacher.photo_url} alt={teacher.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User size={16} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded font-semibold uppercase">
                          MDA Masjid Nurul Huda
                      </span>
                    </div>
                    </div>
                    <div className="space-y-1 mb-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                        <Mail size={12} />
                        <span>{teacher.email}</span>
                    </div>
                    {teacher.phone && (
                        <div className="flex items-center gap-2">
                            <Phone size={12} />
                            <span>{teacher.phone}</span>
                        </div>
                    )}
                    </div>
                    <div className="flex gap-2">
                    <button 
                        onClick={() => handleOpenEdit(teacher)}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-blue-200"
                    >
                        <Edit2 size={12} /> Edit
                    </button>
                    <button
                        onClick={() => handleDelete(teacher.id, teacher.name)}
                        className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-red-200"
                    >
                        <Trash2 size={12} /> Hapus
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
      )}

      {/* Add/Edit Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 text-slate-800">
                {isEditing ? 'Edit Guru' : 'Tambah Guru'}
            </h3>
            <div className="space-y-4 mb-6">

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-300" />
                  )}
                </div>
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer transition-colors">
                  <Upload size={14} />
                  {isUploadingPhoto ? 'Mengunggah...' : 'Unggah Foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Jenis Kelamin</label>
                    <select
                      value={formData.jenis_kelamin || ''}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="">Pilih</option>
                      <option value="LAKI-LAKI">LAKI-LAKI</option>
                      <option value="PEREMPUAN">PEREMPUAN</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Nomor Telepon / WA</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Alamat</label>
                    <textarea
                      value={formData.alamat || ''}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 h-16 resize-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Email (Wajib untuk Login)</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} /> Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
               <Save size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0, name: '' })}
        onConfirm={executeDelete}
        title="Hapus Guru?"
        message={
          <>
            Anda yakin ingin menghapus guru <span className="font-bold text-slate-800">"{deleteModal.name}"</span>? 
            Data yang dihapus tidak dapat dikembalikan.
          </>
        }
        isLoading={isDeleting}
      />

    </div>
  );
}
