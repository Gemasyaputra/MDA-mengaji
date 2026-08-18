import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';

interface KabarPostModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  postId?: number;
  initialTitle?: string;
  initialContent?: string;
  initialImages?: string[];
  onClose: () => void;
  onSuccess: (post: { id: number; title: string; content: string; images: string[] }) => void;
}

// Compress a picked image file down to a WebP data URI before it goes into the payload.
function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.8));
        } else {
          resolve(img.src);
        }
      };
    };
  });
}

export default function KabarPostModal({
  isOpen,
  mode,
  postId,
  initialTitle = '',
  initialContent = '',
  initialImages = [],
  onClose,
  onSuccess,
}: KabarPostModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<string[]>(initialImages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = mode === 'edit';

  // Re-sync the form every time the modal is (re)opened, so it can be reused
  // for a different post without remounting.
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
      setImages(initialImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadingImages(true);
      try {
        const compressedImages = await Promise.all(files.map((file) => compressImage(file)));
        setImages((prev) => [...prev, ...compressedImages]);
      } catch (error) {
        console.error('Compression failed', error);
        toast.error('Gagal memproses gambar.');
      } finally {
        setUploadingImages(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Judul dan konten wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const payload: any = {
        title,
        content,
        activity_date: new Date().toISOString(),
        images,
      };
      if (isEditing && postId) {
        payload.id = postId;
      }

      const res = await fetch('/api/activities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess({ id: postId ?? 0, title, content, images });
      } else {
        const json = await res.json();
        toast.error(`Gagal menyimpan: ${json.error || 'Terjadi kesalahan sistem'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-[95%] max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
        <h3 className="font-bold text-xl mb-6 text-slate-800 border-b border-slate-100 pb-4">
          {isEditing ? 'Edit Kabar' : 'Buat Kabar'}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Judul Kabar <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Masukkan judul kabar..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 transition-all"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Isi Konten <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Tulis isi kabar atau pengumuman di sini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={5}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 transition-all resize-y"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Foto / Gambar Lampiran</label>

          {uploadingImages && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses gambar...
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            disabled={isSubmitting || uploadingImages}
            className="hidden"
          />

          {images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 border-emerald-100 shadow-sm group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    disabled={isSubmitting}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 hover:bg-red-600 transition-all disabled:opacity-50 shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || uploadingImages}
                className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all disabled:opacity-50"
              >
                <ImageIcon size={20} />
                <span className="text-xs font-bold">Tambah</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || uploadingImages}
              className="w-full py-8 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <ImageIcon size={20} />
              </div>
              <span className="text-sm font-bold">Pilih Foto</span>
              <span className="text-xs text-slate-400 font-medium">Klik untuk mencari file (Opsional)</span>
            </button>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || uploadingImages}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : isEditing ? (
              'Simpan Perubahan'
            ) : (
              'Posting Kabar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
