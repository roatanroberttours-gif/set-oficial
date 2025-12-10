import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Upload, Image as ImageIcon, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupabaseSet } from '../hooks/supabaseset';

type GalleryRow = {
  id?: number;
  title?: string | null;
  description?: string | null;
  portada?: string | null;
  imagen1?: string | null;
  imagen2?: string | null;
  imagen3?: string | null;
  imagen4?: string | null;
  created_at?: string | null;
};

export default function AdminGallery() {
  const client = useSupabaseSet();
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<GalleryRow>({});
  const [files, setFiles] = useState<Array<File | null>>([null, null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.from('gallery').select('*').order('id', { ascending: true }).limit(15);
      if (error) throw error;
      setRows((data as GalleryRow[]) || []);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentItem({ title: '', description: '' });
    setFiles([null, null, null, null, null]);
    setModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (r: GalleryRow) => {
    setEditMode(true);
    setCurrentItem({ ...r });
    setFiles([null, null, null, null, null]);
    setModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentItem({});
    setFiles([null, null, null, null, null]);
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFiles(prev => {
      const copy = [...prev];
      copy[index] = f;
      return copy;
    });
  };

  const getStoragePathFromPublicUrl = (url?: string | null) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('galery');
      if (idx === -1) return null;
      return parts.slice(idx + 1).join('/');
    } catch (e) {
      return null;
    }
  };

  const uploadFileIfNeeded = async (file: File | null, slotName: string, prevUrl?: string | null) => {
    if (!file) return prevUrl;
    // remove previous
    try {
      const prevPath = getStoragePathFromPublicUrl(prevUrl);
      if (prevPath) {
        const del = await client.storage.from('galery').remove([prevPath]);
        if (del.error) console.warn('Could not delete previous file', del.error);
      }
    } catch (e) {
      console.warn('Error deleting previous', e);
    }
    const path = `gallery/${Date.now()}_${slotName}_${file.name}`;
    const up = await client.storage.from('galery').upload(path, file, { upsert: true });
    if (up.error) throw up.error;
    const { data: urlData } = client.storage.from('galery').getPublicUrl(path);
    return urlData.publicUrl as string;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const update: any = { ...currentItem };
      
      // Upload new images
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const slot = i === 0 ? 'portada' : `imagen${i}`;
        if (file) {
          const prev = editMode ? rows.find(r => r.id === currentItem.id) : null;
          const newUrl = await uploadFileIfNeeded(file, slot, (prev as any)?.[slot]);
          update[slot] = newUrl;
        }
      }

      if (editMode && currentItem.id) {
        const { error } = await client.from('gallery').update(update).eq('id', currentItem.id).select();
        if (error) throw error;
        setSuccess('Gallery item updated successfully!');
      } else {
        const { error } = await client.from('gallery').insert(update).select();
        if (error) throw error;
        setSuccess('Gallery item created successfully!');
      }

      await loadRows();
      setTimeout(() => closeModal(), 1500);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Delete this card? This action cannot be undone.')) return;
    try {
      // delete stored images
      const row = rows.find(r => r.id === id);
      if (row) {
        ['portada','imagen1','imagen2','imagen3','imagen4'].forEach(async (col) => {
          const p = getStoragePathFromPublicUrl((row as any)[col]);
          if (p) {
            try { await client.storage.from('galery').remove([p]); } catch(e){ console.warn('remove err', e); }
          }
        });
      }
      const { error } = await client.from('gallery').delete().eq('id', id);
      if (error) throw error;
      await loadRows();
    } catch (e) {
      console.error('Delete error', e);
      setError(String((e as any).message || e));
    }
  };

  const openLightbox = (r: GalleryRow, start = 0) => {
    const imgs: string[] = [];
    if (r.portada) imgs.push(r.portada);
    ['imagen1','imagen2','imagen3','imagen4'].forEach(k => {
      const v = (r as any)[k];
      if (v) imgs.push(v);
    });
    if (imgs.length === 0) return;
    setLightboxImages(imgs);
    setLightboxIndex(Math.min(start, imgs.length - 1));
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, lightboxImages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Gallery Management</h1>
              <p className="text-gray-600 mt-1">Create and manage your image galleries</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Gallery
          </button>
        </div>

        {/* Global Alerts */}
        {error && !modalOpen && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && !modalOpen && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">Loading galleries...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No galleries yet</h3>
            <p className="text-gray-600 mb-6">Create your first gallery to showcase your images</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Gallery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {rows.map((r) => {
              const coverImage = r.portada || r.imagen1 || '/placeholder.jpg';
              
              return (
                <div key={r.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Image */}
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(r, 0)}
                  >
                    <img
                      src={coverImage}
                      alt={r.title || 'Gallery'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <span className="text-white font-semibold">View Gallery</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{r.title || 'Untitled'}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{r.description || 'No description'}</p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(r)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-semibold text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit/Create Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{editMode ? 'Edit Gallery' : 'Create New Gallery'}</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Alerts */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-red-800">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800">{success}</span>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={currentItem.title || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                        placeholder="e.g., Beach Sunset Collection"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={currentItem.description || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        placeholder="Brief description..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Gallery Images (up to 5)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[0, 1, 2, 3, 4].map((i) => {
                        const slot = i === 0 ? 'portada' : `imagen${i}`;
                        const existingImage = editMode ? (currentItem as any)[slot] : null;
                        const preview = files[i] ? URL.createObjectURL(files[i]!) : existingImage;

                        return (
                          <div key={i} className="relative">
                            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-orange-500 transition-colors bg-gray-50">
                              {preview ? (
                                <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(i, e)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="absolute bottom-1 right-1 bg-white rounded px-2 py-0.5 text-xs font-semibold shadow">
                              {i === 0 ? 'Cover' : i}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 mt-8 pt-6 border-t-2 border-gray-100">
                  <button
                    onClick={closeModal}
                    disabled={saving}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editMode ? 'Update Gallery' : 'Create Gallery'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
                  disabled={lightboxIndex === 0}
                  className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                <button
                  onClick={() => setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1))}
                  disabled={lightboxIndex === lightboxImages.length - 1}
                  className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            <div className="max-w-6xl w-full">
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Gallery ${lightboxIndex + 1}`}
                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              {lightboxImages.length > 1 && (
                <div className="text-center mt-4">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold">
                    {lightboxIndex + 1} / {lightboxImages.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
