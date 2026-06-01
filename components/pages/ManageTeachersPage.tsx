'use client';

import { Plus, Mail, Phone, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import DeleteModal from '@/components/DeleteModal';
import { toast } from 'sonner';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  nik?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  golongan_darah?: string;
  alamat?: string;
  rt_rw?: string;
  kel_desa?: string;
  kecamatan?: string;
  agama?: string;
  status_perkawinan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
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
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    golongan_darah: '',
    alamat: '',
    rt_rw: '',
    kel_desa: '',
    kecamatan: '',
    agama: '',
    status_perkawinan: '',
    pekerjaan: '',
    kewarganegaraan: '',
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

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
      setFormData({ 
        name: '', email: '', phone: '',
        nik: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '', golongan_darah: '',
        alamat: '', rt_rw: '', kel_desa: '', kecamatan: '', agama: '', status_perkawinan: '',
        pekerjaan: '', kewarganegaraan: ''
      });
      setShowModal(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
      setIsEditing(true);
      setCurrentTeacherId(teacher.id);
      setFormData({
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || '',
          nik: teacher.nik || '',
          tempat_lahir: teacher.tempat_lahir || '',
          tanggal_lahir: teacher.tanggal_lahir ? teacher.tanggal_lahir.substring(0, 10) : '',
          jenis_kelamin: teacher.jenis_kelamin || '',
          golongan_darah: teacher.golongan_darah || '',
          alamat: teacher.alamat || '',
          rt_rw: teacher.rt_rw || '',
          kel_desa: teacher.kel_desa || '',
          kecamatan: teacher.kecamatan || '',
          agama: teacher.agama || '',
          status_perkawinan: teacher.status_perkawinan || '',
          pekerjaan: teacher.pekerjaan || '',
          kewarganegaraan: teacher.kewarganegaraan || ''
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
                    <div className="mb-3">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded font-semibold uppercase">
                        MDA Masjid Nurul Huda
                    </span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">NIK</label>
                    <input
                      type="text"
                      value={formData.nik || ''}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
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
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.tempat_lahir || ''}
                      onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.tanggal_lahir || ''}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
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
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Gol. Darah</label>
                    <input
                      type="text"
                      value={formData.golongan_darah || ''}
                      onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Alamat Lengkap</label>
                    <textarea
                      value={formData.alamat || ''}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 h-16 resize-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">RT / RW</label>
                    <input
                      type="text"
                      value={formData.rt_rw || ''}
                      onChange={(e) => setFormData({ ...formData, rt_rw: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Kel / Desa</label>
                    <input
                      type="text"
                      value={formData.kel_desa || ''}
                      onChange={(e) => setFormData({ ...formData, kel_desa: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Kecamatan</label>
                    <input
                      type="text"
                      value={formData.kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Agama</label>
                    <input
                      type="text"
                      value={formData.agama || ''}
                      onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Status Perkawinan</label>
                    <input
                      type="text"
                      value={formData.status_perkawinan || ''}
                      onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Pekerjaan</label>
                    <input
                      type="text"
                      value={formData.pekerjaan || ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Kewarganegaraan</label>
                    <input
                      type="text"
                      value={formData.kewarganegaraan || ''}
                      onChange={(e) => setFormData({ ...formData, kewarganegaraan: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                
                <div className="pt-2 pb-1 border-b border-slate-100 md:col-span-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Akses Login</p>
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
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Nomor Telepon / WA</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
