import { useEffect, useState } from "react";
import { useSupabaseSet } from "../hooks/supabaseset";

export type Paquete = {
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

export default function PaquetesPage() {
  const client = useSupabaseSet();
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await client.from("paquetes").select("*");
      if (error) {
        setError(error.message);
      } else {
        setPaquetes(data || []);
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Paquetes</h1>
      {loading ? (
        <div>Cargando paquetes...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paquetes.map((paq, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
              <div className="flex gap-2 overflow-x-auto mb-2">
                {[...Array(10)].map((_, i) => {
                  const img = paq[`imagen${i+1}` as keyof Paquete] as string | undefined;
                  return img ? (
                    <img key={i} src={img} alt={`Imagen ${i+1}`} className="w-28 h-20 object-cover rounded" />
                  ) : null;
                })}
              </div>
              <h2 className="text-xl font-semibold mb-2">{paq.titulo}</h2>
              <div className="mb-1"><span className="font-bold">Incluye:</span> {paq.incluye}</div>
              <div className="mb-1"><span className="font-bold">Descripción:</span> {paq.descripcion}</div>
              <div className="mb-1"><span className="font-bold">Duración:</span> {paq.duracion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
