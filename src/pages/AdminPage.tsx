
import React, { useEffect, useState } from "react";
import { useSupabaseSet } from "../hooks/supabaseset";

type AdminRow = {
  id?: number; // Se asume que hay un id en la tabla para identificar la fila
  portada: string;
  portada_galeria: string;
  nombre_web: string;
  celular: string;
  direccion: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  correo: string;
};

export default function AdminPage() {
  const [adminData, setAdminData] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<AdminRow | null>(null);
  const [updating, setUpdating] = useState(false);
  const client = useSupabaseSet();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await client.from("admin").select("*");
      if (error) {
        setError(error.message);
      } else {
        setAdminData(data || []);
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditRow({ ...adminData[idx] });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editRow) return;
    const { name, value } = e.target;
    setEditRow({ ...editRow, [name]: value });
  };

  const handleUpdate = async () => {
    if (editIndex === null || !editRow || !editRow.id) return;
    setUpdating(true);
    const { id, ...updateData } = editRow;
    const { error } = await client.from("admin").update(updateData).eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      const newData = [...adminData];
      newData[editIndex] = editRow;
      setAdminData(newData);
      setEditIndex(null);
      setEditRow(null);
      setError(null);
    }
    setUpdating(false);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditRow(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      {loading ? (
        <div>Cargando datos...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Portada</th>
                <th className="px-4 py-2 border">Portada Galería</th>
                <th className="px-4 py-2 border">Nombre Web</th>
                <th className="px-4 py-2 border">Celular</th>
                <th className="px-4 py-2 border">Dirección</th>
                <th className="px-4 py-2 border">Facebook</th>
                <th className="px-4 py-2 border">Instagram</th>
                <th className="px-4 py-2 border">TikTok</th>
                <th className="px-4 py-2 border">Correo</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adminData.map((row, idx) => (
                <tr key={idx} className="text-center">
                  {editIndex === idx ? (
                    <>
                      <td className="border px-2 py-1">
                        <input type="text" name="portada" value={editRow?.portada || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="portada_galeria" value={editRow?.portada_galeria || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="nombre_web" value={editRow?.nombre_web || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="celular" value={editRow?.celular || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="direccion" value={editRow?.direccion || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="facebook" value={editRow?.facebook || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="instagram" value={editRow?.instagram || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="tiktok" value={editRow?.tiktok || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" name="correo" value={editRow?.correo || ''} onChange={handleChange} className="w-32 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <button onClick={handleUpdate} className="bg-green-500 text-white px-2 py-1 rounded mr-2" disabled={updating}>{updating ? 'Actualizando...' : 'Actualizar'}</button>
                        <button onClick={handleCancel} className="bg-gray-400 text-white px-2 py-1 rounded">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border px-2 py-1">
                        <img src={row.portada} alt="Portada" className="w-20 h-12 object-cover mx-auto" />
                      </td>
                      <td className="border px-2 py-1">
                        <img src={row.portada_galeria} alt="Portada Galería" className="w-20 h-12 object-cover mx-auto" />
                      </td>
                      <td className="border px-2 py-1">{row.nombre_web}</td>
                      <td className="border px-2 py-1">{row.celular}</td>
                      <td className="border px-2 py-1">{row.direccion}</td>
                      <td className="border px-2 py-1">
                        <a href={`https://${row.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Facebook</a>
                      </td>
                      <td className="border px-2 py-1">
                        <a href={`https://${row.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Instagram</a>
                      </td>
                      <td className="border px-2 py-1">
                        <a href={`https://${row.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-black underline">TikTok</a>
                      </td>
                      <td className="border px-2 py-1">{row.correo}</td>
                      <td className="border px-2 py-1">
                        <button onClick={() => handleEdit(idx)} className="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
