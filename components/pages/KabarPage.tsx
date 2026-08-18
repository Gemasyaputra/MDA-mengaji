import { Plus, Trash2, Edit2, MoreVertical, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Post } from '@/types';
import KabarPostModal from '@/components/KabarPostModal';

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
  const [editingPost, setEditingPost] = useState<Post | null>(null);
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
                  timestamp: new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                  avatar: (p.author_name || 'A').charAt(0).toUpperCase(),
                  activity_date: p.activity_date,
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

  const handleEditPost = (post: Post) => {
      setEditingPost(post);
      setShowPostModal(true);
  };

  const handleCloseModal = () => {
      setShowPostModal(false);
      setEditingPost(null);
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
            toast.success('Postingan berhasil dihapus.');
        } else {
            const json = await res.json();
            toast.error(json.error || 'Gagal menghapus postingan.');
        }
    } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Kabar Masjid</h2>
        {currentUser?.role !== 'parent' && (
             <button
                onClick={() => {
                    setEditingPost(null);
                    setShowPostModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
             >
                <Plus size={16} /> Post
             </button>
        )}
      </div>

      {loading ? (
          <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
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
                      <div className="aspect-[4/3] w-full bg-slate-200 rounded-lg" />
                  </div>
              ))}
          </div>
      ) : (
          /* Posts List */
          <div className="space-y-4">
            {posts.length === 0 ? <p className="text-center text-slate-500">Belum ada kabar.</p> : posts.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
                                    {(String(currentUser?.id) === String(post.author_id) || currentUser?.role === 'admin') && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditPost(post);
                                                    setActiveMenuPostId(null);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
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
                    <div className="relative mb-3 aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
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

      {/* Create/Edit Post Modal */}
      <KabarPostModal
        isOpen={showPostModal}
        mode={editingPost ? 'edit' : 'create'}
        postId={editingPost?.id}
        initialTitle={editingPost?.title}
        initialContent={editingPost?.content}
        initialImages={editingPost?.images}
        onClose={handleCloseModal}
        onSuccess={() => {
            handleCloseModal();
            fetchPosts();
        }}
      />

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
