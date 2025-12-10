import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, MapPin, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useSupabaseSet } from '../hooks/supabaseset';

type MeetingPoint = {
  id?: number;
  title: string;
  instructions?: string;
  map_url?: string;
  zone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function AdminMeetingPoints() {
  const client = useSupabaseSet();
  const [points, setPoints] = useState<MeetingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<MeetingPoint>({
    title: '',
    instructions: '',
    map_url: '',
    zone: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from('meeting_points')
        .select('*')
        .order('zone', { ascending: true })
        .order('title', { ascending: true });
      
      if (error) throw error;
      setPoints((data as MeetingPoint[]) || []);
    } catch (err: any) {
      console.error('Error loading meeting points:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentPoint({
      title: '',
      instructions: '',
      map_url: '',
      zone: '',
      is_active: true,
    });
    setModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (point: MeetingPoint) => {
    setEditMode(true);
    setCurrentPoint({ ...point });
    setModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentPoint({
      title: '',
      instructions: '',
      map_url: '',
      zone: '',
      is_active: true,
    });
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setCurrentPoint(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!currentPoint.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const pointData = {
        title: currentPoint.title,
        instructions: currentPoint.instructions || null,
        map_url: currentPoint.map_url || null,
        zone: currentPoint.zone || null,
        is_active: currentPoint.is_active ?? true,
      };

      if (editMode && currentPoint.id) {
        const { error } = await client
          .from('meeting_points')
          .update(pointData)
          .eq('id', currentPoint.id);
        
        if (error) throw error;
        setSuccess('Meeting point updated successfully!');
      } else {
        const { error } = await client
          .from('meeting_points')
          .insert([pointData]);
        
        if (error) throw error;
        setSuccess('Meeting point created successfully!');
      }

      await loadPoints();
      setTimeout(() => closeModal(), 1500);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this meeting point? This action cannot be undone.')) return;

    try {
      const { error } = await client.from('meeting_points').delete().eq('id', id);
      if (error) throw error;
      
      setSuccess('Meeting point deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await loadPoints();
    } catch (err: any) {
      setError(err.message || 'Error deleting meeting point');
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleActive = async (point: MeetingPoint) => {
    try {
      const { error } = await client
        .from('meeting_points')
        .update({ is_active: !point.is_active })
        .eq('id', point.id!);
      
      if (error) throw error;
      await loadPoints();
    } catch (err: any) {
      setError(err.message || 'Error updating status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getZoneColor = (zone?: string) => {
    const colors: Record<string, string> = {
      'West Bay': 'bg-blue-100 text-blue-700',
      'West End': 'bg-green-100 text-green-700',
      'Coxen Hole': 'bg-purple-100 text-purple-700',
      'Sandy Bay': 'bg-orange-100 text-orange-700',
      'French Harbor': 'bg-pink-100 text-pink-700',
    };
    return colors[zone || ''] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Meeting Points</h1>
              <p className="text-gray-600 mt-1">Manage pickup locations and meeting zones</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Point
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
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading meeting points...</p>
          </div>
        ) : points.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No meeting points yet</h3>
            <p className="text-gray-600 mb-6">Create your first meeting point to help customers find pickup locations</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Meeting Point
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Zone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Instructions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Map</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {points.map((point, idx) => (
                    <tr key={point.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">{point.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {point.zone && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getZoneColor(point.zone)}`}>
                            {point.zone}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {point.instructions || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {point.map_url ? (
                          <a
                            href={point.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Map
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No map</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActive(point)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            point.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {point.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(point)}
                            className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => point.id && handleDelete(point.id)}
                            className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{editMode ? 'Edit Meeting Point' : 'Create New Meeting Point'}</h2>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={currentPoint.title}
                        onChange={handleChange}
                        placeholder="e.g., West Bay Beach"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zone
                      </label>
                      <select
                        name="zone"
                        value={currentPoint.zone || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select zone</option>
                        <option value="West Bay">West Bay</option>
                        <option value="West End">West End</option>
                        <option value="Coxen Hole">Coxen Hole</option>
                        <option value="Sandy Bay">Sandy Bay</option>
                        <option value="French Harbor">French Harbor</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Instructions / Directions
                    </label>
                    <textarea
                      name="instructions"
                      value={currentPoint.instructions || ''}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Provide detailed instructions on how to find this meeting point..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Google Maps URL
                    </label>
                    <input
                      type="url"
                      name="map_url"
                      value={currentPoint.map_url || ''}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/?q=16.3268,-86.6108"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste a Google Maps share link or coordinates URL
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={currentPoint.is_active ?? true}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label className="ml-3 text-sm font-semibold text-gray-700">
                      Active (visible to customers)
                    </label>
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
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editMode ? 'Update Point' : 'Create Point'}
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
