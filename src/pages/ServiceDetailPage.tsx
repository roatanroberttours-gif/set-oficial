import React, { useState, useEffect } from "react";
import { formatTextToHtml } from "../lib/formatText";
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
import PolicyConfirmModal from "../components/PolicyConfirmModal";

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
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
        const { data, error } = await clientTop
          .from("admin")
          .select("*")
          .maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error("Error loading admin in ServiceDetailPage", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [clientTop]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadTour();
  }, [id]);

  // Close gallery on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!galleryOpen) return;
      if (e.key === "Escape") {
        setGalleryOpen(false);
        return;
      }
      if (galleryImages.length === 0) return;
      if (e.key === "ArrowLeft")
        setCurrentImageIndex(
          (i) => (i - 1 + galleryImages.length) % galleryImages.length
        );
      if (e.key === "ArrowRight")
        setCurrentImageIndex((i) => (i + 1) % galleryImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryOpen, galleryImages.length]);

  const loadTour = async () => {
    try {
      const client = useSupabaseSet();
      // Intentar buscar por id numérico, sino por titulo (slug)
      let paqQuery: any;
      const numericId = Number(id);
      if (!Number.isNaN(numericId)) {
        paqQuery = await client
          .from("paquetes")
          .select("*")
          .eq("id", numericId)
          .maybeSingle();
      } else {
        paqQuery = await client
          .from("paquetes")
          .select("*")
          .eq("titulo", id)
          .maybeSingle();
      }
      if (paqQuery.error) throw paqQuery.error;
      const paq = paqQuery.data;
      if (!paq) {
        navigate("/");
        return;
      }

      // Construir array de imágenes reales (filtrar vacíos)
      const images = Array.from({ length: 10 })
        .map((_, i) => paq[`imagen${i + 1}`])
        .filter(Boolean) as string[];
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
        name: paq.titulo || "",
        description: paq.descripcion || "",
        personPrice: paq.precio_por_persona ?? paq.price ?? 0,
        price: paq.precio_por_persona ?? paq.price ?? 0,
        image: images[0] || "",
        duration: paq.duracion || "",
        included,
        category: paq.categoria || "adventure",
      } as Tour;

      setTour(mappedTour);
    } catch (error) {
      console.error("Error loading paquete from Supabase:", error);
      navigate("/");
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
      alert("Link copied to clipboard!");
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
    if (value === undefined || value === null) return "";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    } catch {
      return `$${value}`;
    }
  }

  const tabs = [
    { id: "description", label: "Description" },
    { id: "included", label: "Included" },
    { id: "requirements", label: "Requirements" },
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
            Tour not found
          </h2>
          <p className="text-gray-600 mb-6">
            The tour you are looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      {/* Hero Section with Image Background */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-24 pb-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center text-white hover:text-teal-300 transition-all duration-200 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t.common.back}
              </Link>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                    isFavorite
                      ? "text-red-500 bg-white/90 shadow-lg"
                      : "text-white bg-black/30 hover:bg-white/20"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full text-white bg-black/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getCategoryColor(
                    tour.category || "default"
                  )} shadow-lg`}
                >
                  <span className="mr-2 text-lg">
                    {getCategoryIcon(tour.category || "default")}
                  </span>
                  {tour.category === "water-adventure"
                    ? "Water Adventure"
                    : tour.category === "nature"
                    ? "Nature"
                    : tour.category === "romantic"
                    ? "Romantic"
                    : "Adventure"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl animate-fadeInUp">
                {tour.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {tour.duration || "3-4 hours"}
                  </span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="font-medium">Bay Islands</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="font-medium"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div
                className="bg-white rounded-2xl shadow-xl p-6 animate-fadeInUp"
                style={{ animationDelay: "0.1s" }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Photo Gallery
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {galleryImages.slice(0, 8).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setGalleryOpen(true);
                      }}
                      className="relative overflow-hidden rounded-xl aspect-square group"
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Lightbox */}
            {galleryOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setGalleryOpen(false);
                }}
              >
                <div
                  className="relative max-w-5xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setGalleryOpen(false)}
                    className="absolute top-4 right-4 text-white text-xl bg-black/30 rounded-full p-2"
                    aria-label="Close gallery"
                  >
                    ✕
                  </button>

                  <div className="bg-black rounded-lg overflow-hidden">
                    <div className="flex items-center justify-center relative">
                      <button
                        onClick={() =>
                          setCurrentImageIndex(
                            (i) =>
                              (i - 1 + galleryImages.length) %
                              galleryImages.length
                          )
                        }
                        className="absolute left-2 text-white/90 bg-black/30 rounded-full p-2"
                        aria-label="Previous"
                      >
                        ‹
                      </button>

                      <img
                        src={galleryImages[currentImageIndex]}
                        alt={`Imagen ${currentImageIndex + 1}`}
                        className="max-h-[70vh] mx-auto object-contain"
                      />

                      <button
                        onClick={() =>
                          setCurrentImageIndex(
                            (i) => (i + 1) % galleryImages.length
                          )
                        }
                        className="absolute right-2 text-white/90 bg-black/30 rounded-full p-2"
                        aria-label="Next"
                      >
                        ›
                      </button>
                    </div>

                    <div className="p-3 bg-gray-900/80 flex gap-2 overflow-x-auto">
                      {galleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 border ${
                            idx === currentImageIndex
                              ? "border-white"
                              : "border-transparent"
                          } rounded`}
                        >
                          <img
                            src={img}
                            alt={`thumb-${idx}`}
                            className="w-24 h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tour Info Tabs */}
            <div
              className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-4 text-sm font-semibold transition-all duration-300 relative ${
                      activeTab === tab.id
                        ? "text-teal-600 bg-white"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "description" && (
                  <div className="space-y-6">
                    <div
                      className="text-gray-700 leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{
                        __html: formatTextToHtml(tour.description),
                      }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="flex items-start p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-100">
                        <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                          <Clock className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-600 mb-1">
                            Duration
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {tour.duration || "3-4 hours"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "included" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tour.included && tour.included.length > 0 ? (
                      tour.included.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100"
                        >
                          <div className="p-2 bg-white rounded-lg shadow-sm mr-3 flex-shrink-0">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium pt-1">
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium pt-1">
                            Certified guide
                          </span>
                        </div>
                        <div className="flex items-start p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium pt-1">
                            Safety equipment
                          </span>
                        </div>
                        <div className="flex items-start p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium pt-1">
                            Hotel pickup
                          </span>
                        </div>
                        <div className="flex items-start p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium pt-1">
                            Snacks and water
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "requirements" && (
                  <div className="space-y-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {tour.requirements ||
                        "No special requirements. Suitable for all ages and fitness levels."}
                    </p>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg mr-3">
                          <span className="text-2xl">💡</span>
                        </div>
                        <h4 className="font-bold text-amber-900 text-lg">
                          Important Recommendations
                        </h4>
                      </div>
                      <ul className="space-y-3 text-amber-800">
                        <li className="flex items-start">
                          <span className="text-amber-600 mr-3 font-bold">
                            •
                          </span>
                          <span className="font-medium">
                            Bring sunscreen and insect repellent
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-600 mr-3 font-bold">
                            •
                          </span>
                          <span className="font-medium">
                            Wear comfortable clothing and non-slip shoes
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-600 mr-3 font-bold">
                            •
                          </span>
                          <span className="font-medium">
                            Bring a change of clothes for water activities
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-600 mr-3 font-bold">
                            •
                          </span>
                          <span className="font-medium">
                            Stay hydrated during the tour
                          </span>
                        </li>
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
                      Transport from your hotel is included. We will contact you
                      to coordinate the pickup point.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Sidebar (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sticky Pricing Card */}
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Pricing Card */}
              <div
                className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100 animate-fadeInUp"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 text-white">
                  <div className="text-center">
                    <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90"></div>
                    <div className="text-5xl font-bold mb-2">
                      {formatUSD(tour.price)}
                    </div>
                    <p className="text-sm opacity-90">No additional fees</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <button
                    onClick={() => setShowPolicyModal(true)}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                  >
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Book Now
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500 font-medium">
                        or contact us
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={
                        admin?.celular
                          ? `tel:${admin.celular.replace(/\s+/g, "")}`
                          : "tel:+50432267504"
                      }
                      className="flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </a>
                    <a
                      href={
                        admin?.celular
                          ? `https://wa.me/${admin.celular.replace(
                              /[^0-9+]/g,
                              ""
                            )}`
                          : "https://wa.me/50432267504"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Safety and Trust */}
              <div
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg animate-fadeInUp"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="font-bold text-green-900 text-lg">
                    Book with Confidence
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800 font-medium">
                      Certified and experienced guides
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800 font-medium">
                      Liability insurance included
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800 font-medium">
                      Over 500 satisfied adventurers
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div
                className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200 shadow-lg animate-fadeInUp"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-teal-100 rounded-lg mr-3">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Have Questions?
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 font-medium">
                  Our team is ready to help you plan your perfect adventure.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="p-2 bg-teal-50 rounded-lg mr-3">
                      <Phone className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-semibold text-gray-800">
                      {admin?.celular ?? "+504 3226-7504"}
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-800">
                      {admin?.celular ? "WhatsApp 24/7" : "WhatsApp available"}
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-800">
                      Response within 1 hour
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Points removed as requested */}
      </div>

      {/* Policy confirmation modal (shown before booking) */}
      <PolicyConfirmModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        onAccept={() => {
          setShowPolicyModal(false);
          setShowBookingModal(true);
        }}
      />

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
