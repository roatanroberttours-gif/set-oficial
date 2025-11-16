
import React, { useEffect, useState } from "react";
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
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<AdminRow | null>(null);
  const [editFiles, setEditFiles] = useState<Array<File | null>>([null, null, null]);
  const [updating, setUpdating] = useState(false);
  const [lastErrorDetails, setLastErrorDetails] = useState<string | null>(null);
  const client = useSupabaseSet();

  // Admin credentials editor state
  const [credUsername, setCredUsername] = useState<string>('');
  const [credPassword, setCredPassword] = useState<string>('');
  const [credConfirm, setCredConfirm] = useState<string>('');
  const [credLoading, setCredLoading] = useState<boolean>(false);
  const [credMessage, setCredMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      const { data, error } = await client.from("admin").select("*");
      if (!mounted) return;
      if (error) {
        setError(error.message);
      } else {
        setAdminData((data as AdminRow[]) || []);
      }
      setLoading(false);
    }
    fetchData();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load first admin user for credentials editor
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client.from('admins').select('*').limit(1).maybeSingle();
        if (!mounted) return;
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
    })();
    return () => { mounted = false; };
  }, [client]);

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditRow({ ...(adminData[idx] || {}) });
    setEditFiles([null, null, null]);
    setLastErrorDetails(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editRow) return;
    const { name, value } = e.target;
    setEditRow({ ...editRow, [name]: value });
  };

  const handleFileChange = (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setEditFiles(prev => {
      const copy = [...prev];
      copy[slot] = file;
      return copy;
    });
  };

  const getStoragePathFromPublicUrl = (url?: string | null) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('principal');
      if (idx === -1) return null;
      const path = parts.slice(idx + 1).join('/');
      return path || null;
    } catch (e) {
      return null;
    }
  };

  const handleUpdate = async () => {
    if (editIndex === null || !editRow || !editRow.id) return;
    setUpdating(true);
    const { id, ...updateData } = editRow as AdminRow;
    try {
      for (let i = 0; i < editFiles.length; i++) {
        const file = editFiles[i];
        if (file) {
          const slotName = i === 0 ? 'portada' : i === 1 ? 'portada_galeria' : 'logo';

          // borrar imagen anterior si existe
          try {
            const prevUrl = (adminData[editIndex] as any)?.[slotName] as string | undefined;
            const prevPath = getStoragePathFromPublicUrl(prevUrl);
            if (prevPath) {
              try {
                const delResp = await client.storage.from('principal').remove([prevPath]);
                if (delResp.error) {
                  console.warn('No se pudo borrar objeto previo:', delResp.error);
                  setLastErrorDetails(JSON.stringify(delResp.error));
                }
              } catch (e) {
                console.warn('Error borrando objeto previo', e);
                setLastErrorDetails(String(e));
              }
            }
          } catch (e) {
            console.warn('Error borrando imagen previa', e);
          }

          const filePath = `admin/${Date.now()}_${slotName}_${file.name}`;
          try {
            const uploadResp = await client.storage.from('principal').upload(filePath, file, { upsert: true });
            if (uploadResp.error) {
              console.error('Upload error response:', uploadResp.error);
              setError('Error subiendo imagen: ' + (uploadResp.error.message || String(uploadResp.error)));
              setLastErrorDetails(JSON.stringify(uploadResp.error));
              setUpdating(false);
              return;
            }
            const { data: urlData, error: publicErr } = client.storage.from('principal').getPublicUrl(filePath);
            if (publicErr) {
              console.warn('getPublicUrl error:', publicErr);
              setLastErrorDetails(JSON.stringify(publicErr));
            }
            (updateData as any)[slotName] = urlData.publicUrl as string;
          } catch (e) {
            console.error('Exception uploading file:', e);
            setError('Error subiendo imagen (exception)');
            setLastErrorDetails(String(e));
            setUpdating(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Upload error', err);
      setError(String(err));
      setLastErrorDetails(String(err));
      setUpdating(false);
      return;
    }

    const { data, error: updErr } = await client.from("admin").update(updateData).eq("id", id).select();
    if (updErr) {
      setError(updErr.message);
      setLastErrorDetails(JSON.stringify(updErr));
    } else if (data && (data as AdminRow[]).length > 0) {
      const newData = [...adminData];
      newData[editIndex] = (data as AdminRow[])[0];
      setAdminData(newData);
      setEditIndex(null);
      setEditRow(null);
      setEditFiles([null, null, null]);
      setError(null);
      setLastErrorDetails(null);
    } else {
      setError('No se pudo actualizar la fila.');
      setLastErrorDetails('No data returned from update');
    }
    setUpdating(false);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditRow(null);
    setEditFiles([null, null, null]);
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
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin - Site Settings</h2>
      {/* Credentials editor */}
      <div className="p-4 bg-white rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Admin Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Username</label>
            <input value={credUsername} onChange={e => setCredUsername(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input type="password" value={credPassword} onChange={e => setCredPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="Leave blank to keep current" />
          </div>
          <div>
            <label className="block text-sm">Confirm Password</label>
            <input type="password" value={credConfirm} onChange={e => setCredConfirm(e.target.value)} className="w-full p-2 border rounded" placeholder="Repeat password" />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleSaveCredentials} disabled={credLoading} className="px-4 py-2 bg-indigo-600 text-white rounded">{credLoading ? 'Saving...' : 'Update credentials'}</button>
          {credMessage && <span className="ml-4 text-sm text-gray-600">{credMessage}</span>}
        </div>
      </div>
      {lastErrorDetails && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4 text-sm">
          <strong>Last error details:</strong>
          <pre className="whitespace-pre-wrap text-xs mt-2">{lastErrorDetails}</pre>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          {adminData.length === 0 && <p className="text-sm text-gray-500">No rows in the `admin` table.</p>}

          {adminData.map((row, idx) => (
            <div key={row.id ?? idx} className="p-4 bg-white rounded shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left: Gallery */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={
                        editFiles[0] && editIndex === idx
                          ? URL.createObjectURL(editFiles[0] as File)
                          : row.portada || ''
                      }
                      alt="portada"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="mt-3 w-full flex gap-3">
                    <div className="flex-1 h-24 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={
                          editFiles[1] && editIndex === idx
                            ? URL.createObjectURL(editFiles[1] as File)
                            : row.portada_galeria || ''
                        }
                        alt="portada galeria"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                      <img
                        src={
                          editFiles[2] && editIndex === idx
                            ? URL.createObjectURL(editFiles[2] as File)
                            : row.logo || ''
                        }
                        alt="logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {editIndex === idx && (
                    <div className="mt-3 w-full space-y-2">
                      <label className="text-xs text-gray-500">Change Cover</label>
                      <input type="file" accept="image/*" onChange={e => handleFileChange(0, e)} className="w-full text-sm" />
                      <label className="text-xs text-gray-500">Change Gallery Cover</label>
                      <input type="file" accept="image/*" onChange={e => handleFileChange(1, e)} className="w-full text-sm" />
                      <label className="text-xs text-gray-500">Change Logo</label>
                      <input type="file" accept="image/*" onChange={e => handleFileChange(2, e)} className="w-full text-sm" />
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="md:col-span-2">
                  {editIndex === idx ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm">Site Name</label>
                          <input name="nombre_web" value={editRow?.nombre_web || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-sm">Email</label>
                          <input name="correo" value={editRow?.correo || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm">Phone</label>
                          <input name="celular" value={editRow?.celular || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-sm">Address</label>
                          <input name="direccion" value={editRow?.direccion || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm">Facebook</label>
                          <input name="facebook" value={editRow?.facebook || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-sm">Instagram</label>
                          <input name="instagram" value={editRow?.instagram || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-sm">TikTok</label>
                          <input name="tiktok" value={editRow?.tiktok || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button onClick={handleUpdate} disabled={updating} className="px-4 py-2 bg-green-600 text-white rounded">{updating ? 'Saving...' : 'Save'}</button>
                        <button onClick={handleCancel} disabled={updating} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        <div>
                          <button onClick={() => handleEdit(idx)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">{row.celular || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium">{row.correo || '—'}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-medium">{row.direccion || '—'}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Social Links</p>
                        <div className="flex gap-3 mt-2">
                          {row.facebook ? (
                            <a href={`https://${row.facebook}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-100 text-blue-700 rounded">Facebook</a>
                          ) : null}
                          {row.instagram ? (
                            <a href={`https://${row.instagram}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-pink-50 text-pink-600 rounded">Instagram</a>
                          ) : null}
                          {row.tiktok ? (
                            <a href={`https://${row.tiktok}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-gray-100 text-gray-800 rounded">TikTok</a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
