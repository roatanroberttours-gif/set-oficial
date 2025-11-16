import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  Calendar,
  MapPin,
  Check,
  Phone,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Tour } from "../types";
import { useSupabaseSet } from "../hooks/supabaseset";
import BookingModal from "../components/BookingModal";

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [admin, setAdmin] = useState<any | null>(null);
  const clientTop = useSupabaseSet();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await clientTop.from('admin').select('*').maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error('Error loading admin in ServiceDetailPage', err);
      }
    })();
    return () => { mounted = false; };
  }, [clientTop]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadTour();
  }, [id]);

  // Close gallery on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!galleryOpen) return;
      if (e.key === 'Escape') {
        setGalleryOpen(false);
        return;
      }
      if (galleryImages.length === 0) return;
      if (e.key === 'ArrowLeft') setCurrentImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
      if (e.key === 'ArrowRight') setCurrentImageIndex((i) => (i + 1) % galleryImages.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [galleryOpen, galleryImages.length]);

  const loadTour = async () => {
    try {
      const client = useSupabaseSet();
      // Intentar buscar por id numérico, sino por titulo (slug)
      let paqQuery: any;
      const numericId = Number(id);
      if (!Number.isNaN(numericId)) {
        paqQuery = await client.from('paquetes').select('*').eq('id', numericId).maybeSingle();
      } else {
        paqQuery = await client.from('paquetes').select('*').eq('titulo', id).maybeSingle();
      }
      if (paqQuery.error) throw paqQuery.error;
      const paq = paqQuery.data;
      if (!paq) {
        navigate('/services');
        return;
      }

      // Construir array de imágenes reales (filtrar vacíos)
      const images = Array.from({ length: 10 }).map((_, i) => paq[`imagen${i+1}`]).filter(Boolean) as string[];
      setGalleryImages(images);

      let included: string[] | undefined = undefined;
      try {
        if (paq.incluye) {
          const parsed = JSON.parse(paq.incluye);
          if (Array.isArray(parsed)) included = parsed.map(String);
        }
      } catch (e) {
        included = undefined;
      }

      const mappedTour: Tour = {
        id: String(paq.id),
        name: paq.titulo || '',
        description: paq.descripcion || '',
        personPrice: paq.precio_por_persona ?? (paq.price ?? 0),
        price: paq.precio_por_persona ?? (paq.price ?? 0),
        image: images[0] || '',
        duration: paq.duracion || '',
        included,
        category: paq.categoria || 'adventure',
      } as Tour;

      setTour(mappedTour);
    } catch (error) {
      console.error('Error loading paquete from Supabase:', error);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && tour) {
      try {
        await navigator.share({
          title: tour.name,
          text: tour.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert("¡Enlace copiado al portapapeles!");
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // En una implementación real, aquí se guardaría en localStorage o backend
  };

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

  // Formatear USD
  function formatUSD(value?: number) {
    if (value === undefined || value === null) return '';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    } catch {
      return `$${value}`;
    }
  }

  const tabs = [
    { id: "description", label: "Descripción" },
    { id: "included", label: "Incluye" },
    { id: "requirements", label: "Requisitos" },
    { id: "location", label: "Ubicación" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tour no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            El tour que buscas no existe o ha sido removido.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Ver Todos los Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb and Back Button */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/services"
              className="flex items-center text-teal-600 hover:text-teal-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t.common.back} a Servicios
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isFavorite
                    ? "text-red-500 bg-red-50"
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images and Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <button onClick={() => { if (galleryImages.length) { setCurrentImageIndex(0); setGalleryOpen(true); } }} className="w-full block text-left">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-96 object-cover"
                />
              </button>
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getCategoryColor(
                    tour.category || "default"
                  )}`}
                >
                  <span className="mr-1">
                    {getCategoryIcon(tour.category || "default")}
                  </span>
                  {tour.category === "water-adventure"
                    ? "Aventura Acuática"
                    : tour.category === "nature"
                    ? "Naturaleza"
                    : tour.category === "romantic"
                    ? "Romántico"
                    : "Aventura"}
                </span>
              </div>
              <div className="absolute top-4 right-4">
              
              </div>
            </div>

            {/* Gallery Lightbox */}
            {galleryOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                onClick={(e) => { if (e.target === e.currentTarget) setGalleryOpen(false); }}
              >
                <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setGalleryOpen(false)}
                    className="absolute top-4 right-4 text-white text-xl bg-black/30 rounded-full p-2"
                    aria-label="Cerrar galería"
                  >
                    ✕
                  </button>

                  <div className="bg-black rounded-lg overflow-hidden">
                    <div className="flex items-center justify-center relative">
                      <button
                        onClick={() => setCurrentImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)}
                        className="absolute left-2 text-white/90 bg-black/30 rounded-full p-2"
                        aria-label="Anterior"
                      >‹</button>

                      <img src={galleryImages[currentImageIndex]} alt={`Imagen ${currentImageIndex + 1}`} className="max-h-[70vh] mx-auto object-contain" />

                      <button
                        onClick={() => setCurrentImageIndex((i) => (i + 1) % galleryImages.length)}
                        className="absolute right-2 text-white/90 bg-black/30 rounded-full p-2"
                        aria-label="Siguiente"
                      >›</button>
                    </div>

                    <div className="p-3 bg-gray-900/80 flex gap-2 overflow-x-auto">
                      {galleryImages.map((img, idx) => (
                        <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`flex-shrink-0 border ${idx === currentImageIndex ? 'border-white' : 'border-transparent'} rounded`}>
                          <img src={img} alt={`thumb-${idx}`} className="w-24 h-16 object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tour Info Tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "description" && (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {tour.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-teal-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium">Duración</div>
                          <div className="text-gray-600">
                            {tour.duration || "3-4 horas"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-teal-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium">Grupo</div>
                          <div className="text-gray-600">Máx. 8 personas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "included" && (
                  <div className="space-y-3">
                    {tour.included && tour.included.length > 0 ? (
                      tour.included.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-gray-700">
                            Guía certificado
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-gray-700">
                            Equipo de seguridad
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-gray-700">
                            Transporte desde hotel
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-gray-700">
                            Refrigerios y agua
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "requirements" && (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      {tour.requirements ||
                        "Sin requisitos especiales. Apto para todas las edades y niveles de condición física."}
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Recomendaciones:
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Llevar protector solar y repelente</li>
                        <li>• Usar ropa cómoda y calzado antideslizante</li>
                        <li>
                          • Traer cambio de ropa si es una actividad acuática
                        </li>
                        <li>• Mantenerse hidratado durante el tour</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <MapPin className="w-5 h-5 text-teal-500 mr-2" />
                      <span className="font-medium">
                        Roatán Este, Bay Islands, Honduras
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2" />
                        <p>Mapa interactivo</p>
                        <p className="text-sm">
                          Meeting point: Roatán East End
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Transport from your hotel is included. We will contact you to coordinate the pickup point.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {/* Tour Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {tour.name}
              </h1>
              <div className="flex items-center space-x-4 mb-6">
               
                <div className="flex items-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Islas de la Bahía</span>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                  {formatUSD(tour.price)}
                  <span className="text-lg font-normal text-gray-500">
                    {" "}
                    / person
                  </span>
                </div>
                <p className="text-gray-600">
                  Final price, no additional fees
                </p>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg mb-4"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Book Now
              </button>

              <div className="flex space-x-3">
                  <a
                    href={admin?.celular ? `tel:${admin.celular.replace(/\s+/g, '')}` : 'tel:+50432267504'}
                    className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                <a
                  href={admin?.celular ? `https://wa.me/${admin.celular.replace(/[^0-9+]/g, '')}` : 'https://wa.me/50432267504'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Safety and Trust */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-semibold text-green-800 mb-4">
                Reserva con Confianza
              </h3>
              <div className="space-y-3 text-sm text-green-700">
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  <span>Cancelación gratuita hasta 24h antes</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  <span>Guías certificados y experimentados</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  <span>Seguro de responsabilidad civil incluido</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  <span>Más de 500 aventureros satisfechos</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                ¿Tienes Preguntas?
              </h3>
              <p className="text-gray-600 mb-4">
                Nuestro equipo está listo para ayudarte a planificar tu aventura
                perfecta.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-teal-500" />
                  <span>{admin?.celular ?? '+504 3226-7504'}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2 text-teal-500" />
                  <span>{admin?.celular ? 'WhatsApp disponible 24/7' : 'WhatsApp disponible'}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-teal-500" />
                  <span>Respuesta en menos de 1 hora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          selectedTour={tour}
        />
      )}
    </div>
  );
};

export default ServiceDetailPage;
