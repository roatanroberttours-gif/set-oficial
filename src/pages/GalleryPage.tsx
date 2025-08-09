import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { GalleryItem } from "../types";
import { getGallery } from "../services/googleSheets";

const GalleryPage: React.FC = () => {
  const { t } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadGallery();
  }, []);

  useEffect(() => {
    filterImages();
  }, [galleryItems, selectedCategory]);

  const loadGallery = async () => {
    try {
      const galleryData = await getGallery();
      setGalleryItems(galleryData);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterImages = () => {
    if (selectedCategory === "all") {
      setFilteredItems(galleryItems);
    } else {
      setFilteredItems(
        galleryItems.filter((item) => item.category === selectedCategory)
      );
    }
  };

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredItems.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(
        (selectedImage - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  const categories = [
    { value: "all", label: "Todas", count: galleryItems.length },
    {
      value: "mangroves",
      label: "Manglares",
      count: galleryItems.filter((i) => i.category === "mangroves").length,
    },
    {
      value: "underwater",
      label: "Submarinas",
      count: galleryItems.filter((i) => i.category === "underwater").length,
    },
    {
      value: "nature",
      label: "Naturaleza",
      count: galleryItems.filter((i) => i.category === "nature").length,
    },
    {
      value: "sunset",
      label: "Atardeceres",
      count: galleryItems.filter((i) => i.category === "sunset").length,
    },
    {
      value: "wildlife",
      label: "Fauna",
      count: galleryItems.filter((i) => i.category === "wildlife").length,
    },
    {
      value: "aerial",
      label: "Aéreas",
      count: galleryItems.filter((i) => i.category === "aerial").length,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "mangroves":
        return "bg-green-500";
      case "underwater":
        return "bg-blue-500";
      case "nature":
        return "bg-emerald-500";
      case "sunset":
        return "bg-orange-500";
      case "wildlife":
        return "bg-yellow-500";
      case "aerial":
        return "bg-purple-500";
      default:
        return "bg-teal-500";
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

        {/* Gallery Skeleton */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-64"></div>
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
      <section className="relative py-20 text-white overflow-hidden min-h-[90vh] md:min-h-[110vh] flex items-center justify-center">
        <img
          src="/2.webp"
          alt="Galería Roatan East Hidden Gem"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ filter: "brightness(0.7)" }}
        />
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t.gallery.title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {t.gallery.subtitle}
            </p>
            <div className="text-lg">
              <span className="font-semibold">{galleryItems.length}</span> Fotos
              Increíbles de Nuestras Aventuras
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.value
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center text-gray-600">
            Mostrando {filteredItems.length} de {galleryItems.length} fotos
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No se encontraron fotos
              </h3>
              <p className="text-gray-600 mb-6">
                No hay fotos en esta categoría
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
              >
                Ver Todas las Fotos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => openLightbox(index)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-sm mb-1">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-gray-200 text-xs line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-white text-xs font-medium ${getCategoryColor(
                          item.category || "general"
                        )}`}
                      >
                        {categories.find((c) => c.value === item.category)
                          ?.label || "General"}
                      </span>
                    </div>

                    {/* Hover Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {filteredItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-16 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[selectedImage].image}
              alt={filteredItems[selectedImage].title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white font-semibold text-xl mb-2">
                {filteredItems[selectedImage].title}
              </h3>
              {filteredItems[selectedImage].description && (
                <p className="text-gray-200">
                  {filteredItems[selectedImage].description}
                </p>
              )}
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            {selectedImage + 1} / {filteredItems.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
