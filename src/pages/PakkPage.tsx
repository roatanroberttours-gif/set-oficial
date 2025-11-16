import { useEffect, useState, ChangeEvent } from "react";
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
};

export default function PakkPage() {
  const client = useSupabaseSet();
  const [pakk, setPakk] = useState<Pakk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editPakk, setEditPakk] = useState<Pakk | null>(null);
  const [editImages, setEditImages] = useState<(File | null)[]>(Array(10).fill(null));
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
    const handleDelete = async (id?: number) => {
      if (!id) return;
      const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.");
      if (!confirmDelete) return;
      setDeleting(id);
      const { error } = await client.from("paquetes").delete().eq("id", id);
      if (!error) {
        setPakk((prev) => prev.filter((p) => p.id !== id));
      }
      setDeleting(null);
    };

    const handleEditClick = (idx: number) => {
      setEditIndex(idx);
      setEditPakk({ ...pakk[idx] });
      setEditImages(Array(10).fill(null));
      setEditError(null);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!editPakk) return;
      const { name, value } = e.target;
      setEditPakk({ ...editPakk, [name]: value });
    };

    const handleEditImageChange = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
      setEditImages((prev) => {
        const arr = [...prev];
        arr[idx] = file;
        return arr;
      });
    };

    const handleEditSave = async () => {
      if (editIndex === null || !editPakk || !editPakk.id) return;
      setAdding(true);
      setEditError(null);
      let imageUrls: string[] = [];
      for (let i = 0; i < editImages.length; i++) {
        if (editImages[i]) {
          const file = editImages[i]!;
          const filePath = `pakk/${Date.now()}_${i}_${file.name}`;
          const { error: uploadError } = await client.storage.from('paquetes').upload(filePath, file, { upsert: true });
          if (uploadError) {
            setEditError('Error subiendo imagen: ' + uploadError.message);
            setAdding(false);
            return;
          }
          const { data: urlData } = client.storage.from('paquetes').getPublicUrl(filePath);
          imageUrls[i] = urlData.publicUrl;
        } else {
          imageUrls[i] = editPakk[`imagen${i+1}` as keyof Pakk] as string || '';
        }
      }
      const paqueteToUpdate: any = { ...editPakk };
      for (let i = 0; i < 10; i++) {
        paqueteToUpdate[`imagen${i+1}`] = imageUrls[i] || '';
      }
      const { error, data } = await client.from("paquetes").update(paqueteToUpdate).eq("id", editPakk.id).select();
      if (error) {
        setEditError(error.message);
      } else if (data && data.length > 0) {
        const newArr = [...pakk];
        newArr[editIndex] = data[0];
        setPakk(newArr);
        setEditIndex(null);
        setEditPakk(null);
        setEditImages(Array(10).fill(null));
      }
      setAdding(false);
    };

    const handleEditCancel = () => {
      setEditIndex(null);
      setEditPakk(null);
      setEditImages(Array(10).fill(null));
      setEditError(null);
    };
  const [newPakk, setNewPakk] = useState<Pakk>({
    titulo: '',
    incluye: '[]', // JSON string
    descripcion: '',
    duracion: '',
  });
  const [images, setImages] = useState<(File | null)[]>(Array(10).fill(null));
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await client.from("paquetes").select("*");
      if (error) {
        setError(error.message);
      } else {
        setPakk(data || []);
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPakk((prev) => ({ ...prev, [name]: value }));
  };

  // Helper para mostrar el campo incluye como lista
  function renderIncluye(incluye: string) {
    try {
      const arr = JSON.parse(incluye);
      if (Array.isArray(arr)) {
        return (
          <ul className="list-disc pl-5 mb-1">
            {arr.map((item, i) => (
              <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
            ))}
          </ul>
        );
      }
    } catch {
      // Si no es JSON válido, mostrar como texto
      return <span>{incluye}</span>;
    }
    return <span>{incluye}</span>;
  }

  const handleImageChange = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setImages((prev) => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    let imageUrls: string[] = [];
    // Subir imágenes al bucket 'paquetes'
    for (let i = 0; i < images.length; i++) {
      if (images[i]) {
        const file = images[i]!;
        const filePath = `pakk/${Date.now()}_${i}_${file.name}`;
        const { error: uploadError } = await client.storage.from('paquetes').upload(filePath, file, { upsert: true });
        if (uploadError) {
          setAddError('Error subiendo imagen: ' + uploadError.message);
          setAdding(false);
          return;
        }
        const { data: urlData } = client.storage.from('paquetes').getPublicUrl(filePath);
        imageUrls[i] = urlData.publicUrl;
      } else {
        imageUrls[i] = '';
      }
    }
    // Construir objeto para insertar
    const paqueteToInsert: any = { ...newPakk };
    for (let i = 0; i < 10; i++) {
      paqueteToInsert[`imagen${i+1}`] = imageUrls[i] || '';
    }
    const { error, data } = await client.from("paquetes").insert([paqueteToInsert]).select();
    if (error) {
      setAddError(error.message);
    } else if (data && data.length > 0) {
      setPakk((prev) => [data[0], ...prev]);
      setNewPakk({ titulo: '', incluye: '', descripcion: '', duracion: '' });
      setImages(Array(10).fill(null));
    }
    setAdding(false);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800 drop-shadow">Pakk</h1>
      <form onSubmit={handleAdd} className="mb-10 bg-white/90 p-6 rounded-xl shadow-lg max-w-2xl mx-auto border border-blue-100">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Agregar nuevo paquete</h2>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="titulo" value={newPakk.titulo} onChange={handleChange} placeholder="Título" className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
          <textarea name="incluye" value={newPakk.incluye} onChange={handleChange} placeholder='Incluye (JSON array, ej: [{"item":"valor"}])' className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 min-h-[60px]" />
        </div>
        <div className="mb-4">
          <textarea name="descripcion" value={newPakk.descripcion} onChange={handleChange} placeholder="Descripción" className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="mb-4">
          <input name="duracion" value={newPakk.duracion} onChange={handleChange} placeholder="Duración" className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <label className="block text-xs font-semibold text-blue-700 mb-1">Imagen {i+1}</label>
              <input type="file" accept="image/*" onChange={e => handleImageChange(i, e)} className="w-full text-xs" />
            </div>
          ))}
        </div>
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-lg font-bold shadow hover:from-blue-700 hover:to-blue-500 transition" disabled={adding}>{adding ? 'Agregando...' : 'Agregar'}</button>
        {addError && <div className="text-red-600 mt-2">{addError}</div>}
      </form>
      {loading ? (
        <div>Cargando datos...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pakk.map((paq, idx) => (
            <div key={idx} className="bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col border border-blue-100 hover:shadow-2xl transition relative">
              {editIndex === idx ? (
                <>
                  <div className="flex gap-2 overflow-x-auto mb-4 rounded-lg">
                    {[...Array(10)].map((_, i) => {
                      const img = editImages[i]
                        ? URL.createObjectURL(editImages[i] as File)
                        : (editPakk && editPakk[`imagen${i+1}` as keyof Pakk] as string);
                      return (
                        <div key={i} className="flex flex-col items-center">
                          {img && <img src={img} alt={`Imagen ${i+1}`} className="w-24 h-16 object-cover rounded border mb-1" />}
                          <input type="file" accept="image/*" onChange={e => handleEditImageChange(i, e)} className="w-24 text-xs" />
                        </div>
                      );
                    })}
                  </div>
                  <input name="titulo" value={editPakk?.titulo || ''} onChange={handleEditChange} placeholder="Título" className="w-full border border-blue-200 rounded px-3 py-2 mb-2" />
                  <textarea name="incluye" value={editPakk?.incluye || ''} onChange={handleEditChange} placeholder='Incluye (JSON array, ej: [{"item":"valor"}])' className="w-full border border-blue-200 rounded px-3 py-2 mb-2 min-h-[60px]" />
                  <textarea name="descripcion" value={editPakk?.descripcion || ''} onChange={handleEditChange} placeholder="Descripción" className="w-full border border-blue-200 rounded px-3 py-2 mb-2" />
                  <input name="duracion" value={editPakk?.duracion || ''} onChange={handleEditChange} placeholder="Duración" className="w-full border border-blue-200 rounded px-3 py-2 mb-4" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleEditSave} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition" disabled={adding}>{adding ? 'Guardando...' : 'Guardar'}</button>
                    <button onClick={handleEditCancel} className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-gray-500 transition">Cancelar</button>
                  </div>
                  {editError && <div className="text-red-600 mt-2">{editError}</div>}
                </>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto mb-4 rounded-lg">
                    {[...Array(10)].map((_, i) => {
                      const img = paq[`imagen${i+1}` as keyof Pakk] as string | undefined;
                      return img ? (
                        <img key={i} src={img} alt={`Imagen ${i+1}`} className="w-32 h-24 object-cover rounded-lg border border-blue-200 shadow-sm" />
                      ) : null;
                    })}
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-blue-700">{paq.titulo}</h2>
                  <div className="mb-1"><span className="font-semibold text-blue-600">Incluye:</span> {renderIncluye(paq.incluye)}</div>
                  <div className="mb-1"><span className="font-semibold text-blue-600">Descripción:</span> {paq.descripcion}</div>
                  <div className="mb-1"><span className="font-semibold text-blue-600">Duración:</span> {paq.duracion}</div>
                  <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={() => handleEditClick(idx)} className="bg-yellow-400 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition">Editar</button>
                    <button onClick={() => handleDelete(paq.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-red-700 transition" disabled={deleting === paq.id}>{deleting === paq.id ? 'Eliminando...' : 'Eliminar'}</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
