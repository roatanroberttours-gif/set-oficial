import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star, ArrowRight, Calendar, Search } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Tour } from "../types";
import { useSupabaseSet } from "../hooks/supabaseset";
import BookingModal from "../components/BookingModal";
import { formatTextToHtml } from "../lib/formatText";

const ServicesPage: React.FC = () => {
  const { t } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<Tour | undefined>();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const client = useSupabaseSet();

  useEffect(() => {
    loadTours();
  }, []);

  useEffect(() => {
    filterTours();
  }, [tours, selectedCategory, searchTerm]);

  const loadTours = async () => {
    try {
      setLoading(true);
      const { data, error } = await client.from("paquetes").select("*");
      if (error) throw error;

      const mapped: Tour[] = (data || []).map((paq: any) => {
        const images = Array.from({ length: 10 }).map(
          (_, i) => paq[`imagen${i + 1}`]
        );
        const image = images.find((img: any) => img) || "";

        let included: string[] | undefined = undefined;
        try {
          if (paq.incluye) {
            const parsed = JSON.parse(paq.incluye);
            if (Array.isArray(parsed)) included = parsed.map(String);
          }
        } catch (e) {
          included = undefined;
        }

        return {
          id: String(paq.id),
          name: paq.titulo || "",
          description: paq.descripcion || "",
          personPrice: paq.precio_por_persona ?? paq.price ?? 0,
          price: paq.precio_por_persona ?? paq.price ?? 0,
          image,
          duration: paq.duracion || "",
          included,
          category: paq.categoria || "adventure",
        };
      });

      setTours(mapped);
    } catch (error) {
      console.error("Error loading tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTours = () => {
    let filtered = [...tours];

    // FILTRO POR CATEGORÍA
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (t) =>
          (t.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // FILTRO POR BÚSQUEDA
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term)
      );
    }

    setFilteredTours(filtered);
  };

  const handleBookNow = (tour: Tour) => {
    setSelectedTour(tour);
    setShowBookingModal(true);
  };

  const categories = [
    { value: "all", label: "Todos los Tours", count: tours.length },
    {
      value: "water-adventure",
      label: "Aventuras Acuáticas",
      count: tours.filter((t) => t.category === "water-adventure").length,
    },
    {
      value: "nature",
      label: "Naturaleza",
      count: tours.filter((t) => t.category === "nature").length,
    },
    {
      value: "romantic",
      label: "Románticos",
      count: tours.filter((t) => t.category === "romantic").length,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "water-adventure":
        return "🏊‍♂️";
      case "nature":
        return "🌿";
      case "romantic":
        return "💕";
      default:
        return "🏝️";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "water-adventure":
        return "from-blue-500 to-cyan-500";
      case "nature":
        return "from-green-500 to-emerald-500";
      case "romantic":
        return "from-pink-500 to-rose-500";
      default:
        return "from-teal-500 to-blue-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        {/* Skeleton */}
        <section className="py-20 bg-transparent">
          <div className="container mx-auto px-4 text-center animate-pulse">
            <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-4"></div>
            <div className="h-6 bg-white/20 rounded w-2/3 mx-auto"></div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-20 bg-transparent text-white relative">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t.services.title}
          </h1>
          <p className="text-xl mb-8">{t.services.subtitle}</p>
        </div>
      </section>

      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4">
          {/* === FILTROS Y BÚSQUEDA === */}
          <div className="mb-10">
            {/* Barra de búsqueda */}
            <div className="flex items-center bg-white px-4 py-3 rounded-xl shadow border w-full md:w-1/2 mx-auto mb-6">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-3 w-full outline-none text-gray-700"
              />
            </div>

            {/* Categorías */}
            <div className="flex gap-3 justify-center flex-wrap"></div>
          </div>

          {/* Si no hay tours */}
          {filteredTours.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold">No se encontraron tours</h3>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className="mt-4 px-6 py-3 bg-teal-500 text-white rounded-lg"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            /* GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour, index) => (
                <div
                  key={tour.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-white bg-gradient-to-r ${getCategoryColor(
                          tour.category
                        )}`}
                      >
                        {getCategoryIcon(tour.category)} {tour.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{tour.name}</h3>
                    <div
                      className="text-gray-600 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: formatTextToHtml(tour.description) }}
                    />

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock className="w-4 h-4 mr-2 text-teal-500" />
                      {tour.duration}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold">${tour.price}</span>
                      <span className="text-gray-500">/ persona</span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        to={`/service/${tour.id}`}
                        className="flex-1 px-4 py-3 border border-teal-500 text-teal-600 rounded-lg text-center"
                      >
                        {t.services.viewDetails}
                      </Link>

                      <button
                        onClick={() => handleBookNow(tour)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg"
                      >
                        {t.services.bookNow}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          selectedTour={selectedTour}
        />
      )}
    </div>
  );
};

export default ServicesPage;
