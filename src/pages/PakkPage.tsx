import { useEffect, useState, ChangeEvent } from "react";
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Upload, Image as ImageIcon, DollarSign, Clock, Users, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { useSupabaseSet } from "../hooks/supabaseset";

export type Pakk = {
  id?: number;
  imagen1?: string;
  imagen2?: string;
  imagen3?: string;
  imagen4?: string;
  imagen5?: string;
  imagen6?: string;
  imagen7?: string;
  imagen8?: string;
  imagen9?: string;
  imagen10?: string;
  titulo: string;
  incluye: string;
  descripcion: string;
  duracion: string;
  categoria?: string;
  precio_por_persona?: number;
  max_personas?: number;
};

export default function PakkPage() {
  const client = useSupabaseSet();
  const [pakk, setPakk] = useState<Pakk[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPakk, setCurrentPakk] = useState<Pakk>({
    titulo: '',
    incluye: '',
    descripcion: '',
    duracion: '',
    categoria: '',
    precio_por_persona: undefined,
    max_personas: undefined,
  });
  const [images, setImages] = useState<(File | null)[]>(Array(10).fill(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPakk();
  }, []);

  const loadPakk = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.from("paquetes").select("*").order('id', { ascending: false });
      if (error) throw error;
      setPakk(data || []);
    } catch (err: any) {
      console.error('Error loading packages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIncluyeArray = (str: string) => {
    return str.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
  };

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentPakk({
      titulo: '',
      incluye: '',
      descripcion: '',
      duracion: '',
      categoria: '',
      precio_por_persona: undefined,
      max_personas: undefined,
    });
    setImages(Array(10).fill(null));
    setModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (paq: Pakk) => {
    setEditMode(true);
    setCurrentPakk({ ...paq });
    setImages(Array(10).fill(null));
    setModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentPakk({
      titulo: '',
      incluye: '',
      descripcion: '',
      duracion: '',
      categoria: '',
    });
    setImages(Array(10).fill(null));
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentPakk(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImages(prev => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  const handleSave = async () => {
    if (!currentPakk.titulo.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const imageUrls: string[] = [];
      
      // Upload images
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const file = images[i]!;
          const filePath = `pakk/${Date.now()}_${i}_${file.name}`;
          const { error: uploadError } = await client.storage.from('paquetes').upload(filePath, file, { upsert: true });
          if (uploadError) throw new Error('Error uploading image: ' + uploadError.message);
          
          const { data: urlData } = client.storage.from('paquetes').getPublicUrl(filePath);
          imageUrls[i] = urlData.publicUrl;
        } else if (editMode) {
          imageUrls[i] = currentPakk[`imagen${i+1}` as keyof Pakk] as string || '';
        }
      }

      const paqueteData: any = {
        titulo: currentPakk.titulo,
        descripcion: currentPakk.descripcion,
        duracion: currentPakk.duracion,
        categoria: currentPakk.categoria || null,
        incluye: JSON.stringify(getIncluyeArray(currentPakk.incluye)),
        precio_por_persona: currentPakk.precio_por_persona || null,
        max_personas: currentPakk.max_personas || null,
      };

      for (let i = 0; i < 10; i++) {
        paqueteData[`imagen${i+1}`] = imageUrls[i] || '';
      }

      if (editMode && currentPakk.id) {
        const { data, error } = await client.from("paquetes").update(paqueteData).eq("id", currentPakk.id).select();
        if (error) throw error;
        if (data && data.length > 0) {
          setPakk(prev => prev.map(p => p.id === currentPakk.id ? data[0] : p));
        }
        setSuccess('Package updated successfully!');
      } else {
        const { data, error } = await client.from("paquetes").insert([paqueteData]).select();
        if (error) throw error;
        if (data && data.length > 0) {
          setPakk(prev => [data[0], ...prev]);
        }
        setSuccess('Package created successfully!');
      }

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) return;

    try {
      const { error } = await client.from("paquetes").delete().eq("id", id);
      if (error) throw error;
      setPakk(prev => prev.filter(p => p.id !== id));
      setSuccess('Package deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error deleting package');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getCategoryLabel = (cat?: string) => {
    switch (cat) {
      case 'water-adventure': return 'Water Adventure';
      case 'nature': return 'Nature';
      case 'romantic': return 'Romantic';
      default: return 'Adventure';
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'water-adventure': return 'bg-blue-100 text-blue-700';
      case 'nature': return 'bg-green-100 text-green-700';
      case 'romantic': return 'bg-pink-100 text-pink-700';
      default: return 'bg-teal-100 text-teal-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Tour Packages</h1>
              <p className="text-gray-600 mt-1">Manage your tour packages and experiences</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Package
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
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-600">Loading packages...</p>
          </div>
        ) : pakk.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No packages yet</h3>
            <p className="text-gray-600 mb-6">Create your first tour package to get started</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pakk.map((paq) => {
              const mainImage = paq.imagen1 || paq.imagen2 || paq.imagen3 || '/placeholder.jpg';
              const includedItems = paq.incluye ? JSON.parse(paq.incluye) : [];
              
              return (
                <div key={paq.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={mainImage}
                      alt={paq.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(paq.categoria)}`}>
                        {getCategoryLabel(paq.categoria)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{paq.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{paq.descripcion}</p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {paq.duracion && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-teal-600" />
                          {paq.duracion}
                        </div>
                      )}
                      {paq.precio_por_persona && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 text-teal-600" />
                          ${paq.precio_por_persona} per person
                        </div>
                      )}
                      {paq.max_personas && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-teal-600" />
                          Max {paq.max_personas} people
                        </div>
                      )}
                    </div>

                    {/* Included Items */}
                    {includedItems.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">INCLUDES:</p>
                        <div className="flex flex-wrap gap-1">
                          {includedItems.slice(0, 3).map((item: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {item}
                            </span>
                          ))}
                          {includedItems.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              +{includedItems.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(paq)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => paq.id && handleDelete(paq.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-semibold"
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

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{editMode ? 'Edit Package' : 'Create New Package'}</h2>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-1" />
                        Title *
                      </label>
                      <input
                        type="text"
                        name="titulo"
                        value={currentPakk.titulo}
                        onChange={handleChange}
                        placeholder="e.g., Snorkeling Adventure"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        name="categoria"
                        value={currentPakk.categoria || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select category</option>
                        <option value="water-adventure">Water Adventure</option>
                        <option value="nature">Nature</option>
                        <option value="romantic">Romantic</option>
                        <option value="adventure">Adventure</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      name="descripcion"
                      value={currentPakk.descripcion}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe your tour package..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duracion"
                        value={currentPakk.duracion}
                        onChange={handleChange}
                        placeholder="e.g., 3-4 hours"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Price per Person
                      </label>
                      <input
                        type="number"
                        name="precio_por_persona"
                        value={currentPakk.precio_por_persona ?? ''}
                        onChange={(e) => setCurrentPakk(prev => ({ ...prev, precio_por_persona: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Max People
                      </label>
                      <input
                        type="number"
                        name="max_personas"
                        value={currentPakk.max_personas ?? ''}
                        onChange={(e) => setCurrentPakk(prev => ({ ...prev, max_personas: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="0"
                        min="1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What's Included? <span className="text-gray-500 font-normal">(Separate with double spaces)</span>
                    </label>
                    <textarea
                      name="incluye"
                      value={currentPakk.incluye}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Equipment  Guide  Snacks  Transportation"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors resize-none"
                    />
                    {getIncluyeArray(currentPakk.incluye).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getIncluyeArray(currentPakk.incluye).map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Images (up to 10)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const existingImage = editMode ? currentPakk[`imagen${i+1}` as keyof Pakk] as string : null;
                        const preview = images[i] ? URL.createObjectURL(images[i]!) : existingImage;

                        return (
                          <div key={i} className="relative">
                            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-teal-500 transition-colors bg-gray-50">
                              {preview ? (
                                <img src={preview} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(i, e)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="absolute bottom-1 right-1 bg-white rounded px-2 py-0.5 text-xs font-semibold shadow">
                              {i + 1}
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
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editMode ? 'Update Package' : 'Create Package'}
                      </>
                    )}
                  </button>
                </div>
              </div>
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
