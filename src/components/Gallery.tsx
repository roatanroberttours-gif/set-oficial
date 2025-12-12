import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { GalleryItem } from "../types";
import { useSupabaseSet } from "../hooks/supabaseset";
import { formatTextToHtml } from "../lib/formatText";

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const client = useSupabaseSet();

  useEffect(() => {
    loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from("gallery")
        .select("*")
        .order("id", { ascending: false })
        .limit(6);
      if (error) throw error;
      const mapped: GalleryItem[] = (data || []).map((g: any) => ({
        id: String(g.id),
        image:
          g.portada || g.imagen1 || g.imagen2 || g.imagen3 || g.imagen4 || "",
        title: g.title || g.titulo || "",
        description: g.description || g.descripcion || "",
        category: g.category || "general",
        images: [g.portada, g.imagen1, g.imagen2, g.imagen3, g.imagen4].filter(
          Boolean
        ) as string[],
      }));
      setGalleryItems(mapped.slice(0, 6));
    } catch (err) {
      console.error("Error loading gallery from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
    document.body.style.overflow = "unset";
  };

  // keyboard navigation for row-lightbox
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") setLightboxIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => Math.min(lightboxImages.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, lightboxImages.length]);

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

  const getCategoryName = (category: string) => {
    switch (category) {
      case "mangroves":
        return "Manglares";
      case "underwater":
        return "Submarino";
      case "nature":
        return "Naturaleza";
      case "sunset":
        return "Atardeceres";
      case "wildlife":
        return "Fauna";
      case "aerial":
        return "Aéreas";
      default:
        return "General";
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.gallery.title}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {t.gallery.subtitle}
          </p>
        </div>

        {/* Gallery Grid - Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 mb-12">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative break-inside-avoid overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onClick={() => {
                const imgs = (item as any).images || [item.image];
                if (!imgs || imgs.length === 0) return;
                setLightboxImages(imgs);
                setLightboxIndex(0);
                setLightboxOpen(true);
                document.body.style.overflow = "hidden";
              }}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Overlay - Gradient always present but subtle, stronger on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/20 text-white border border-white/20 ${getCategoryColor(
                        item.category || "general"
                      ).replace("bg-", "bg-opacity-80 ")}`}
                    >
                      {getCategoryName(item.category || "general")}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-xl md:text-2xl mb-2 drop-shadow-md">
                    {item.title}
                  </h3>
                  {item.description && (
                    <div
                      className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"
                      dangerouslySetInnerHTML={{ __html: formatTextToHtml(item.description) }}
                    />
                  )}
                </div>

                {/* Hover Icon (Central) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)">
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

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-teal-400 hover:to-blue-500"
          >
            {t.gallery.viewAll}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Lightbox para imágenes de la fila */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {lightboxImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => Math.max(0, i - 1));
                }}
                className="absolute left-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    Math.min(lightboxImages.length - 1, i + 1)
                  );
                }}
                className="absolute right-16 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImages[lightboxIndex]}
              alt={`Imagen ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
