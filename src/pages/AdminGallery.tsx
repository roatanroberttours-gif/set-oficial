import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GalleryRow>({});
  const [files, setFiles] = useState<Array<File | null>>([null, null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state: when user toca una card se muestran todas sus imágenes
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRows = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.from('gallery').select('*').order('id', { ascending: true }).limit(15);
      if (error) throw error;
      setRows((data as GalleryRow[]) || []);
    } catch (err: any) {
      console.error('Error loading gallery rows', err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setForm({ title: '', description: '' });
    setFiles([null, null, null, null, null]);
  };

  const handleEdit = (r: GalleryRow) => {
    setEditingId(r.id ?? null);
    setForm({ ...r });
    setFiles([null, null, null, null, null]);
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
    try {
      const update: any = { ...form };
      // upload files slots: 0->portada, 1..4 imagen1..imagen4
      const prev = rows.find(r => r.id === editingId);
      const prevUrls = prev || {};
      const uploaded: any = {};
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const slot = i === 0 ? 'portada' : `imagen${i}`;
        if (file) {
          const newUrl = await uploadFileIfNeeded(file, slot, (prevUrls as any)?.[slot]);
          uploaded[slot] = newUrl;
        }
      }
      Object.assign(update, uploaded);

      if (editingId) {
        const { data, error } = await client.from('gallery').update(update).eq('id', editingId).select();
        if (error) throw error;
      } else {
        const { data, error } = await client.from('gallery').insert(update).select();
        if (error) throw error;
      }
      await loadRows();
      setEditingId(null);
      setForm({});
      setFiles([null, null, null, null, null]);
    } catch (err: any) {
      console.error('Save error', err);
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
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-full bg-white/90 hover:bg-gray-100 shadow">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <h2 className="text-2xl font-bold">Admin Gallery</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handleNew} className="px-4 py-2 bg-blue-600 text-white rounded">New Card</button>
            <button onClick={loadRows} className="px-4 py-2 bg-gray-100 rounded">Reload</button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700">{error}</div>}

        {/* Editor */}
        {(editingId !== null || form.title !== undefined) && (
          <div className="mb-6 bg-white p-4 rounded shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="text-sm">Title</label>
                <input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="text-sm">Description</label>
                <input value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 border rounded" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="p-2 bg-gray-50 rounded">
                  <label className="text-xs text-gray-500">{i===0 ? 'Cover' : `Image ${i}`}</label>
                  <div className="h-32 bg-gray-100 my-2 rounded overflow-hidden flex items-center justify-center">
                    {files[i] ? (
                      <img src={URL.createObjectURL(files[i] as File)} alt="preview" className="w-full h-full object-cover" />
                    ) : (editingId ? (
                      <img src={(form as any)[i===0 ? 'portada' : `imagen${i}`] || ''} alt="preview" className="w-full h-full object-cover" />
                    ) : null)}
                  </div>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(i, e)} />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setEditingId(null); setForm({}); setFiles([null,null,null,null,null]); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        )}

        {/* Grid: 5 columns per row, up to 15 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {rows.slice(0,15).map((r, idx) => (
            <div key={r.id ?? idx} className="bg-white rounded shadow overflow-hidden">
              <div onClick={() => openLightbox(r, 0)} role="button" tabIndex={0} className="h-40 bg-gray-100 overflow-hidden cursor-pointer">
                <img src={r.portada || r.imagen1 || ''} alt={r.title || ''} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1">{r.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-500 line-clamp-3 mb-2">{r.description || ''}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(r)} className="flex-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setLightboxOpen(false)} />
            <div className="relative max-w-4xl w-full mx-4">
              <div className="bg-transparent p-2 rounded">
                  <img src={lightboxImages[lightboxIndex]} alt={`Image ${lightboxIndex+1}`} className="w-full max-h-[80vh] object-contain mx-auto rounded" />
                <div className="flex items-center justify-between mt-2">
                  <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, i - 1)); }} className="px-3 py-1 bg-white/90 rounded">‹</button>
                  <div className="text-sm text-white/90">{lightboxIndex + 1} / {lightboxImages.length}</div>
                  <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1)); }} className="px-3 py-1 bg-white/90 rounded">›</button>
                </div>
                <div className="absolute top-2 right-2">
                  <button onClick={() => setLightboxOpen(false)} className="px-2 py-1 bg-white/90 rounded">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
