import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Video, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useSupabaseSet } from '../hooks/supabaseset';

type VideoRow = {
  id?: number;
  video1?: string | null;
  video2?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function AdminVideos() {
  const client = useSupabaseSet();
  const [videoData, setVideoData] = useState<VideoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.from('videos').select('*').maybeSingle();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      setVideoData(data || { video1: null, video2: null });
    } catch (err: any) {
      console.error('Error loading videos:', err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
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

  const uploadVideo = async (file: File, slotName: string, prevUrl?: string | null) => {
    // Delete previous video if exists
    if (prevUrl) {
      try {
        const prevPath = getStoragePathFromPublicUrl(prevUrl);
        if (prevPath) {
          const del = await client.storage.from('galery').remove([prevPath]);
          if (del.error) console.warn('Could not delete previous video', del.error);
        }
      } catch (e) {
        console.warn('Error deleting previous video', e);
      }
    }

    // Upload new video
    const path = `videos/${Date.now()}_${slotName}_${file.name}`;
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
      const update: any = {};

      // Upload video1 if selected
      if (video1File) {
        const newUrl = await uploadVideo(video1File, 'video1', videoData?.video1);
        update.video1 = newUrl;
      }

      // Upload video2 if selected
      if (video2File) {
        const newUrl = await uploadVideo(video2File, 'video2', videoData?.video2);
        update.video2 = newUrl;
      }

      if (Object.keys(update).length === 0) {
        setError('Please select at least one video to upload');
        setSaving(false);
        return;
      }

      // Update or insert
      if (videoData?.id) {
        const { data, error } = await client.from('videos').update(update).eq('id', videoData.id).select();
        if (error) throw error;
        if (data && data.length > 0) setVideoData(data[0]);
      } else {
        const { data, error } = await client.from('videos').insert([update]).select();
        if (error) throw error;
        if (data && data.length > 0) setVideoData(data[0]);
      }

      setSuccess('Videos updated successfully!');
      setVideo1File(null);
      setVideo2File(null);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (slot: 'video1' | 'video2') => {
    if (!videoData?.id) return;
    if (!confirm(`Are you sure you want to delete ${slot}? This action cannot be undone.`)) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const prevUrl = videoData[slot];
      if (prevUrl) {
        const prevPath = getStoragePathFromPublicUrl(prevUrl);
        if (prevPath) {
          await client.storage.from('galery').remove([prevPath]);
        }
      }

      const update = { [slot]: null };
      const { data, error } = await client.from('videos').update(update).eq('id', videoData.id).select();
      if (error) throw error;
      if (data && data.length > 0) setVideoData(data[0]);

      setSuccess(`${slot} deleted successfully!`);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 rounded-full bg-white shadow hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Manager</h1>
            <p className="text-gray-600 mt-1">Upload and manage homepage videos (max 2)</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading videos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Video 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-orange-600" />
                  Video 1
                </h3>
                {videoData?.video1 && (
                  <button
                    onClick={() => handleDeleteVideo('video1')}
                    disabled={saving}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete video 1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Current Video Preview */}
              {videoData?.video1 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current video:</p>
                  <video
                    src={videoData.video1}
                    controls
                    className="w-full rounded-lg border border-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              {/* Upload New */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {videoData?.video1 ? 'Replace with new video:' : 'Upload video:'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo1File(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
                {video1File && (
                  <p className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Selected: {video1File.name}
                  </p>
                )}
              </div>
            </div>

            {/* Video 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-orange-600" />
                  Video 2
                </h3>
                {videoData?.video2 && (
                  <button
                    onClick={() => handleDeleteVideo('video2')}
                    disabled={saving}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete video 2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Current Video Preview */}
              {videoData?.video2 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current video:</p>
                  <video
                    src={videoData.video2}
                    controls
                    className="w-full rounded-lg border border-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              {/* Upload New */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {videoData?.video2 ? 'Replace with new video:' : 'Upload video:'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo2File(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
                {video2File && (
                  <p className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Selected: {video2File.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {!loading && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSave}
              disabled={saving || (!video1File && !video2File)}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 mr-2" />
              {saving ? 'Uploading...' : 'Save Videos'}
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Important Notes
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Videos are stored in the same Supabase bucket as gallery images (galery)</li>
            <li>• When you upload a new video, the previous one will be automatically deleted</li>
            <li>• Maximum 2 videos can be displayed on the homepage</li>
            <li>• Supported formats: MP4, WebM, OGG (MP4 recommended for best compatibility)</li>
            <li>• Videos will appear below the "Adventure Gallery" section on the homepage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
