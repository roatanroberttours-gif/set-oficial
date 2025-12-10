
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, Mail, Phone, MapPin, Globe, Facebook, Instagram, Image as ImageIcon, Shield, AlertCircle, CheckCircle, Edit2 } from 'lucide-react';
import { useSupabaseSet } from "../hooks/supabaseset";

type AdminRow = {
  id?: number;
  portada?: string | null;
  portada_galeria?: string | null;
  logo?: string | null;
  nombre_web?: string | null;
  celular?: string | null;
  direccion?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  correo?: string | null;
};

export default function AdminPage() {
  const [adminData, setAdminData] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<AdminRow | null>(null);
  const [editFiles, setEditFiles] = useState<Array<File | null>>([null, null, null]);
  const [saving, setSaving] = useState(false);
  const client = useSupabaseSet();

  // Admin credentials editor state
  const [credUsername, setCredUsername] = useState<string>('');
  const [credPassword, setCredPassword] = useState<string>('');
  const [credConfirm, setCredConfirm] = useState<string>('');
  const [credLoading, setCredLoading] = useState<boolean>(false);
  const [credMessage, setCredMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
    loadCredentials();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.from("admin").select("*");
      if (error) throw error;
      setAdminData((data as AdminRow[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCredentials = async () => {
    try {
      const { data, error } = await client.from('admins').select('*').limit(1).maybeSingle();
      if (error) {
        console.warn('Error loading admin credentials:', error.message);
        return;
      }
      if (data) {
        setCredUsername((data as any).username || '');
      }
    } catch (e) {
      console.warn('Error loading admin credentials', e);
    }
  };

  const openEditModal = (row: AdminRow) => {
    setCurrentRow({ ...row });
    setEditFiles([null, null, null]);
    setModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentRow(null);
    setEditFiles([null, null, null]);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentRow) return;
    const { name, value } = e.target;
    setCurrentRow({ ...currentRow, [name]: value });
  };

  const handleFileChange = (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditFiles(prev => {
      const copy = [...prev];
      copy[slot] = file;
      return copy;
    });
  };

  const handleUpdate = async () => {
    if (!currentRow || !currentRow.id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { id, ...updateData } = currentRow as AdminRow;
      
      // Upload new images
      for (let i = 0; i < editFiles.length; i++) {
        const file = editFiles[i];
        if (file) {
          const slotName = i === 0 ? 'portada' : i === 1 ? 'portada_galeria' : 'logo';
          const filePath = `admin/${Date.now()}_${slotName}_${file.name}`;
          
          const uploadResp = await client.storage.from('principal').upload(filePath, file, { upsert: true });
          if (uploadResp.error) throw new Error('Error uploading image: ' + uploadResp.error.message);
          
          const urlResult = client.storage.from('principal').getPublicUrl(filePath);
          if (urlResult?.data?.publicUrl) {
            (updateData as any)[slotName] = urlResult.data.publicUrl;
          }
        }
      }

      const { data, error: updErr } = await client.from("admin").update(updateData).eq("id", id).select();
      if (updErr) throw updErr;
      
      if (data && (data as AdminRow[]).length > 0) {
        setAdminData(prev => prev.map(row => row.id === id ? data[0] : row));
        setSuccess('Settings updated successfully!');
        setTimeout(() => closeModal(), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCredentials = async () => {
    setCredMessage(null);
    if (!credUsername) {
      setCredMessage('Username is required');
      return;
    }
    if (credPassword && credPassword !== credConfirm) {
      setCredMessage('Passwords do not match');
      return;
    }
    setCredLoading(true);
    try {
      let payload: any = { username: credUsername };
      if (credPassword) {
        const bcrypt = (await import('bcryptjs')).default;
        const hash = await bcrypt.hash(credPassword, 10);
        payload.password_hash = hash;
      }

      // Upsert by username
      const { data, error } = await client.from('admins').upsert([payload]).select();
      if (error) {
        setCredMessage('Error saving credentials: ' + error.message);
      } else {
        setCredMessage('Credentials saved successfully');
        setCredPassword('');
        setCredConfirm('');
      }
    } catch (e: any) {
      setCredMessage('Error: ' + String(e?.message || e));
    }
    setCredLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Site Settings</h1>
              <p className="text-gray-600 mt-1">Manage your website configuration and content</p>
            </div>
          </div>
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

        {/* Credentials Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Credentials</h2>
              <p className="text-gray-600 text-sm">Update admin access credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input 
                value={credUsername} 
                onChange={e => setCredUsername(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input 
                type="password" 
                value={credPassword} 
                onChange={e => setCredPassword(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors" 
                placeholder="Leave blank to keep current" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input 
                type="password" 
                value={credConfirm} 
                onChange={e => setCredConfirm(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors" 
                placeholder="Repeat password" 
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSaveCredentials} 
              disabled={credLoading} 
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
            >
              {credLoading ? 'Saving...' : 'Update Credentials'}
            </button>
            {credMessage && (
              <span className={`text-sm font-medium ${credMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {credMessage}
              </span>
            )}
          </div>
        </div>

        {/* Site Settings */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        ) : adminData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No settings found</h3>
            <p className="text-gray-600">Please contact support to initialize settings</p>
          </div>
        ) : (
          <div className="space-y-6">
            {adminData.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Images Section */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Website Images
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cover */}
                    <div>
                      <p className="text-white text-sm font-semibold mb-2">Main Cover</p>
                      <div className="relative aspect-video bg-white/20 rounded-lg overflow-hidden">
                        <img src={row.portada || ''} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    {/* Gallery Cover */}
                    <div>
                      <p className="text-white text-sm font-semibold mb-2">Gallery Cover</p>
                      <div className="relative aspect-video bg-white/20 rounded-lg overflow-hidden">
                        <img src={row.portada_galeria || ''} alt="Gallery Cover" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    {/* Logo */}
                    <div>
                      <p className="text-white text-sm font-semibold mb-2">Logo</p>
                      <div className="relative aspect-video bg-white/20 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={row.logo || ''} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Contact & Social Information</h3>
                    <button
                      onClick={() => openEditModal(row)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-semibold"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Settings
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Site Name */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Site Name</p>
                        <p className="font-semibold text-gray-900">{row.nombre_web || '—'}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                        <p className="font-semibold text-gray-900">{row.correo || '—'}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                        <p className="font-semibold text-gray-900">{row.celular || '—'}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                        <p className="font-semibold text-gray-900">{row.direccion || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Social Media</p>
                    <div className="flex flex-wrap gap-3">
                      {row.facebook && (
                        <a 
                          href={`https://${row.facebook}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </a>
                      )}
                      {row.instagram && (
                        <a 
                          href={`https://${row.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors font-semibold"
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </a>
                      )}
                      {row.tiktok && (
                        <a 
                          href={`https://${row.tiktok}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                          TikTok
                        </a>
                      )}
                      {!row.facebook && !row.instagram && !row.tiktok && (
                        <p className="text-gray-500 text-sm">No social links added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {modalOpen && currentRow && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Site Settings</h2>
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
                  {/* Images Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Update Images
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Cover */}
                      <div className="relative">
                        <div className="aspect-video border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-purple-500 transition-colors bg-gray-50">
                          <img 
                            src={editFiles[0] ? URL.createObjectURL(editFiles[0]) : currentRow.portada || ''} 
                            alt="Cover" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(0, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <p className="text-xs text-gray-600 mt-1 text-center">Main Cover</p>
                      </div>
                      {/* Gallery Cover */}
                      <div className="relative">
                        <div className="aspect-video border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-purple-500 transition-colors bg-gray-50">
                          <img 
                            src={editFiles[1] ? URL.createObjectURL(editFiles[1]) : currentRow.portada_galeria || ''} 
                            alt="Gallery Cover" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(1, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <p className="text-xs text-gray-600 mt-1 text-center">Gallery Cover</p>
                      </div>
                      {/* Logo */}
                      <div className="relative">
                        <div className="aspect-video border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-purple-500 transition-colors bg-gray-50 flex items-center justify-center">
                          <img 
                            src={editFiles[2] ? URL.createObjectURL(editFiles[2]) : currentRow.logo || ''} 
                            alt="Logo" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(2, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <p className="text-xs text-gray-600 mt-1 text-center">Logo</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        name="nombre_web"
                        value={currentRow.nombre_web || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="correo"
                        value={currentRow.correo || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        name="celular"
                        value={currentRow.celular || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        name="direccion"
                        value={currentRow.direccion || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Social Media Links</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Facebook</label>
                        <input
                          type="text"
                          name="facebook"
                          value={currentRow.facebook || ''}
                          onChange={handleChange}
                          placeholder="facebook.com/yourpage"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Instagram</label>
                        <input
                          type="text"
                          name="instagram"
                          value={currentRow.instagram || ''}
                          onChange={handleChange}
                          placeholder="instagram.com/yourprofile"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">TikTok</label>
                        <input
                          type="text"
                          name="tiktok"
                          value={currentRow.tiktok || ''}
                          onChange={handleChange}
                          placeholder="tiktok.com/@yourprofile"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        />
                      </div>
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
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
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
