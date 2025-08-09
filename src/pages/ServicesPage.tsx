import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Users,
  Star,
  ArrowRight,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Tour } from "../types";
import { getTours } from "../services/googleSheets";
import BookingModal from "../components/BookingModal";

const ServicesPage: React.FC = () => {
  const { t } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<Tour | undefined>(undefined);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTours();
  }, []);

  useEffect(() => {
    filterTours();
  }, [tours, selectedCategory, searchTerm]);

  const loadTours = async () => {
    try {
      const toursData = await getTours();
      setTours(toursData);
    } catch (error) {
      console.error("Error loading tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTours = () => {
    let filtered = tours;

   

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
        {/* Hero Section Skeleton */}
        <section className="py-20 bg-gradient-to-br from-teal-500 to-blue-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-white/20 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-16 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t.services.title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {t.services.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-lg">
                <span className="font-semibold">{tours.length}</span> Tours
                Disponibles
              </div>
              <div className="text-lg">
                <span className="font-semibold">4.9/5</span> Calificación
                Promedio
              </div>
              <div className="text-lg">
                <span className="font-semibold">500+</span> Aventureros Felices
              </div>
            </div>
          </div>
        </div>
      </section>

   
      {/* Tours Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTours.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No se encontraron tours
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta cambiar los filtros o el término de búsqueda
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour, index) => (
                <div
                  key={tour.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getCategoryColor(tour.category || "default")}`}
                      >
                        <span className="mr-1">
                          {getCategoryIcon(tour.category || "default")}
                        </span>
                        {tour.category === "water-adventure"
                          ? "Agua"
                          : tour.category === "nature"
                            ? "Naturaleza"
                            : tour.category === "romantic"
                              ? "Romántico"
                              : "Aventura"}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors duration-200">
                      {tour.name}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {tour.description}
                    </p>

                    {/* Tour Details */}
                    <div className="space-y-2 mb-6">
                      {tour.duration && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2 text-teal-500" />
                          <span>{tour.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2 text-teal-500" />
                        <span>Grupos pequeños (máx. 8 personas)</span>
                      </div>
                      {tour.included && tour.included.length > 0 && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Incluye:</span>{" "}
                          {tour.included.slice(0, 2).join(", ")}
                          {tour.included.length > 2 && "..."}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-2xl font-bold text-gray-800">
                          ${tour.price}
                        </span>
                        <span className="text-gray-500 ml-1">/ persona</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/service/${tour.id}`}
                        className="flex-1 flex items-center justify-center px-4 py-3 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors duration-200"
                      >
                        <span className="text-sm font-medium">
                          {t.services.viewDetails}
                        </span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>

                      <button
                        onClick={() => handleBookNow(tour)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {t.services.bookNow}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
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
