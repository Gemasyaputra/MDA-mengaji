import { Plus, Image as ImageIcon, X, Trash2, Edit2, MoreVertical, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { Post } from '@/types';

interface KabarPageProps {
  onNavigate: (page: string) => void;
  currentUser?: any;
}

export default function KabarPage({ onNavigate, currentUser }: KabarPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit/Menu State
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<number | null>(null);
  

  // Fetch Posts
  const fetchPosts = async (pageNum: number = 1) => {
      try {
          const res = await fetch(`/api/activities?page=${pageNum}&limit=5&t=${Date.now()}`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
              const mappedPosts = json.data.map((p: any) => ({
                  id: p.id,
                  author: p.author_name || 'Admin',
                  author_id: p.author_id,
                  title: p.title,
                  content: p.content,
                  timestamp: new Date(p.created_at).toLocaleDateString(),
                  avatar: (p.author_name || 'A').charAt(0).toUpperCase(),
                  activity_date: p.activity_date,
                  comment_count: Number(p.comment_count) || 0,
                  images: Array.isArray(p.images) ? p.images : []
              }));

              if (pageNum === 1) {
                  setPosts(mappedPosts);
              } else {
                  setPosts(prev => [...prev, ...mappedPosts]);
              }

              if (mappedPosts.length < 5) {
                  setHasMore(false);
              } else {
                  setHasMore(true);
              }
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Compression Helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; // Increased width for better quality
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
              // Compress to WebP with 0.8 quality (approx 200-500KB usually)
              const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
              resolve(compressedDataUrl);
          } else {
              resolve(img.src); // Fallback if context fails
          }
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setLoading(true); // Re-use loading state or add a local one if preferred, but for now just process.
      
      try {
          // Process all files regardless of size
          const compressedImages = await Promise.all(files.map(file => compressImage(file)));
          setPostImages(prev => [...prev, ...compressedImages]);
      } catch (error) {
          console.error("Compression failed", error);
      } finally {
          setLoading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
        toast.error('Judul dan konten wajib diisi!');
        return;
    }

    if (!currentUser) {
        toast.error('Sesi tidak valid. Silakan refresh halaman.');
        return;
    }

    setIsSubmitting(true);
    try {
        const method = isEditing ? 'PUT' : 'POST';
        const payload: any = {
            title: postTitle,
            content: postContent,
            author_id: currentUser.id,// Defaulting if missing
            activity_date: new Date().toISOString(),
            images: postImages
        };

        if (isEditing && editingPostId) {
            payload.id = editingPostId;
        }

        const res = await fetch('/api/activities', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            setPostTitle('');
            setPostContent('');
            setPostImages([]);
            setShowPostModal(false);
            setIsEditing(false);
            setEditingPostId(null);
            fetchPosts(); // Refresh list to see changes
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

  const handleEditPost = (post: Post) => {
      setPostTitle(post.title);
      setPostContent(post.content);
      setPostImages(post.images || []);
      setEditingPostId(post.id);
      setIsEditing(true);
      setShowPostModal(true);
  };

  const handleCloseModal = () => {
      setShowPostModal(false);
      setIsEditing(false);
      setEditingPostId(null);
      setPostTitle('');
      setPostContent('');
      setPostImages([]);
  };

  const confirmDeletePost = async () => {
    if (postToDelete === null) return;

    try {
        const res = await fetch(`/api/activities?id=${postToDelete}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            setPosts(prev => prev.filter(post => post.id !== postToDelete));
            setShowDeleteConfirm(false);
            setPostToDelete(null);
        } else {
            console.error('Failed to delete post');
        }
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="p-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Kabar Masjid</h2>
        {currentUser?.role !== 'parent' && (
             <button
                onClick={() => {
                    setIsEditing(false);
                    setEditingPostId(null);
                    setPostTitle('');
                    setPostContent('');
                    setPostImages([]);
                    setShowPostModal(true);
                }}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
             >
                <Plus size={14} /> Post
             </button>
        )}
      </div>

      {loading ? (
          <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                          <div className="flex-1 space-y-2">
                              <div className="h-4 w-1/3 bg-slate-200 rounded" />
                              <div className="h-3 w-1/4 bg-slate-200 rounded" />
                          </div>
                      </div>
                      <div className="h-4 w-3/4 bg-slate-200 rounded mb-3" />
                      <div className="space-y-2 mb-3">
                          <div className="h-3 w-full bg-slate-200 rounded" />
                          <div className="h-3 w-full bg-slate-200 rounded" />
                          <div className="h-3 w-2/3 bg-slate-200 rounded" />
                      </div>
                      <div className="h-48 w-full bg-slate-200 rounded-lg" />
                  </div>
              ))}
          </div>
      ) : (
          /* Posts List */
          <div className="space-y-4">
            {posts.length === 0 ? <p className="text-center text-slate-500">Belum ada kabar.</p> : posts.map(post => (
              <div 
                key={post.id} 
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigate(`kabar-detail?id=${post.id}`)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      {post.avatar}
                    </div>
                    {/* Header Info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{post.author}</h4>
                      <p className="text-xs text-slate-400">{post.timestamp}</p>
                    </div>

                    {/* Options Menu (Bagikan/Edit/Delete) */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                            }}
                            className="text-slate-400 hover:text-emerald-500 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <MoreVertical size={20} />
                        </button>
                        
                        {/* Kebab Menu Dropdown */}
                        {activeMenuPostId === post.id && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuPostId(null);
                                    }}
                                />
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-20 overflow-hidden">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const url = `${window.location.origin}/public/kabar/${post.id}`;
                                            const text = `Kabar Masjid: ${post.title}\nBaca selengkapnya di:\n${url}`;
                                            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                                            window.open(waUrl, '_blank');
                                            setActiveMenuPostId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
                                    >
                                        <Share2 size={14} /> Bagikan ke WA
                                    </button>

                                    {/* Edit/Delete Only for Author/Admin */}
                                    {(String(currentUser?.id) === String(post.author_id) || currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditPost(post);
                                                    setActiveMenuPostId(null);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPostToDelete(post.id);
                                                    setShowDeleteConfirm(true);
                                                    setActiveMenuPostId(null);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Hapus
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-slate-800 mb-2">{post.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">{post.content}</p>

                  {/* Image Preview (First Image Only) */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative mb-3 h-48 rounded-lg overflow-hidden bg-slate-100">
                        <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                        {post.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                                +{post.images.length - 1} Foto Lainnya
                            </div>
                        )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && (
        <div className="mt-6 text-center">
            <button
                onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchPosts(nextPage);
                }}
                className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full text-sm font-semibold hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm"
            >
                Muat Lebih Banyak
            </button>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-[95%] max-w-md md:max-w-2xl p-6 md:p-8 shadow-2xl">
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
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
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
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                disabled={isSubmitting}
                rows={5}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 transition-all resize-y"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Foto / Gambar Lampiran
              </label>
              
              {/* Image Preview or Upload Button */}
              {postImages.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                      {postImages.map((img, idx) => (
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
                  </div>
              ) : (
                  <div>
                      <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          disabled={isSubmitting}
                          className="hidden"
                      />
                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="w-full py-8 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all disabled:opacity-50"
                      >
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                            <ImageIcon size={20} />
                          </div>
                          <span className="text-sm font-bold">Pilih Foto</span>
                          <span className="text-xs text-slate-400 font-medium">Klik untuk mencari file (Opsional)</span>
                      </button>
                  </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting}
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
                ) : (
                    isEditing ? 'Simpan Perubahan' : 'Posting Kabar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-bold text-lg mb-2 text-slate-800">Hapus Postingan?</h3>
            <p className="text-sm text-slate-500 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeletePost}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
