import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { GalleryItem } from "../types";
import { useSupabaseSet } from "../hooks/supabaseset";
import { formatTextToHtml } from "../lib/formatText";

// We'll read admin.portada_galeria to show as the gallery hero background

const GalleryPage: React.FC = () => {
  const { t } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  // lightbox for a single row: muestra portada + imagen1..imagen4
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const client = useSupabaseSet();
  const [admin, setAdmin] = useState<any | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client
          .from("admin")
          .select("*")
          .maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error("Error loading admin for gallery:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from("gallery")
        .select("*")
        .order("id", { ascending: false })
        .limit(100);
      if (error) throw error;
      const mapped: GalleryItem[] = (data || []).map((g: any) => ({
        id: String(g.id),
        image:
          g.portada || g.imagen1 || g.imagen2 || g.imagen3 || g.imagen4 || "",
        title: g.title || g.titulo || "",
        description: g.description || g.descripcion || "",
        category: g.category || "general",
        // images array keeps all images of the row for the lightbox
        images: [g.portada, g.imagen1, g.imagen2, g.imagen3, g.imagen4].filter(
          Boolean
        ) as string[],
      }));
      setGalleryItems(mapped);
    } catch (error) {
      console.error("Error loading gallery from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    // legacy: keep selected index for whole-grid navigation if needed
    setSelectedImage(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % galleryItems.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(
        (selectedImage - 1 + galleryItems.length) % galleryItems.length
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  // keyboard navigation for row-lightbox
  useEffect(() => {
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "mangroves":
        return "Mangroves";
      case "underwater":
        return "Underwater";
      case "nature":
        return "Nature";
      case "sunset":
        return "Sunset";
      case "wildlife":
        return "Wildlife";
      case "aerial":
        return "Aerial";
      default:
        return "General";
    }
  };

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
      <div className="min-h-screen pt-20 bg-transparent">
        {/* Hero Section Skeleton */}
        <section className="py-20 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-white/20 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Gallery Skeleton */}
        <section className="py-12 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl h-80"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-transparent">
      {/* Hero Section */}
      <section className="relative py-16 bg-transparent overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent animate-fade-in">
              {t.gallery.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6 animate-fade-in-up">
              {t.gallery.subtitle}
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 animate-fade-in-up">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{galleryItems.length}</span>
              <span className="text-white/80">amazing moments captured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 pb-20 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {galleryItems.length === 0 ? (
            <div className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No photos found
              </h3>
              <p className="text-white/70 mb-6">There are no photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 cursor-pointer animate-fade-in-up"
                  onClick={() => {
                    const imgs = (item as any).images || [item.image];
                    if (!imgs || imgs.length === 0) return;
                    setLightboxImages(imgs);
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                    document.body.style.overflow = "hidden";
                  }}
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Image Container with aspect ratio */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-teal-500/10 to-blue-500/10">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700 ease-out"
                      loading="lazy"
                    />
                    
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500">
                    </div>

                    {/* Content Overlay - always visible at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white font-bold text-base mb-1 drop-shadow-lg">
                        {item.title}
                      </h3>
                      {item.description && (
                        <div 
                          className="text-white/90 text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" 
                          dangerouslySetInnerHTML={{ __html: formatTextToHtml(item.description) }} 
                        />
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 transform -translate-x-1 group-hover:translate-x-0 transition-transform duration-300">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg backdrop-blur-sm ${getCategoryColor(
                          item.category || "general"
                        )}`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {getCategoryLabel(item.category || "general")}
                      </span>
                    </div>

                    {/* Hover Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
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

      {/* Enhanced Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-6 right-6 z-20 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:rotate-90 transition-all duration-300 border border-white/20 group"
            aria-label="Close"
          >
            <X className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </button>

          {/* Navigation Buttons */}
          {lightboxImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => Math.max(0, i - 1));
                }}
                disabled={lightboxIndex === 0}
                className="absolute left-6 z-20 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 group"
                aria-label="Previous"
              >
                <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    Math.min(lightboxImages.length - 1, i + 1)
                  );
                }}
                disabled={lightboxIndex === lightboxImages.length - 1}
                className="absolute right-6 z-20 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 group"
                aria-label="Next"
              >
                <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {/* Image Container with animation */}
          <div
            className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative animate-scale-in">
              <img
                key={lightboxIndex}
                src={lightboxImages[lightboxIndex]}
                alt={`Imagen ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
              />
              
              {/* Image glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl -z-10 opacity-50"></div>
            </div>
          </div>

          {/* Image Counter & Thumbnails */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
            {/* Counter */}
            <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white font-semibold border border-white/20 shadow-lg">
              <span className="text-teal-300">{lightboxIndex + 1}</span>
              <span className="text-white/60 mx-2">/</span>
              <span className="text-white/80">{lightboxImages.length}</span>
            </div>

            {/* Thumbnail Navigation */}
            {lightboxImages.length > 1 && lightboxImages.length <= 10 && (
              <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
                {lightboxImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                    }}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 border-2 ${
                      idx === lightboxIndex
                        ? 'border-teal-400 scale-110 shadow-lg shadow-teal-500/50'
                        : 'border-white/20 hover:border-white/40 hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
