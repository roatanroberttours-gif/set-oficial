import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { GalleryItem } from "../types";
import { useSupabaseSet } from "../hooks/supabaseset";

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
        const { data, error } = await client.from('admin').select('*').maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error('Error loading admin for gallery:', err);
      }
    })();
    return () => { mounted = false; };
  }, [client]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.from('gallery').select('*').order('id', { ascending: false }).limit(100);
      if (error) throw error;
      const mapped: GalleryItem[] = (data || []).map((g: any) => ({
        id: String(g.id),
        image: g.portada || g.imagen1 || g.imagen2 || g.imagen3 || g.imagen4 || '',
        title: g.title || g.titulo || '',
        description: g.description || g.descripcion || '',
        category: g.category || 'general',
        // images array keeps all images of the row for the lightbox
        images: [g.portada, g.imagen1, g.imagen2, g.imagen3, g.imagen4].filter(Boolean) as string[],
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
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') setLightboxIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, lightboxImages.length]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'mangroves': return 'Mangroves';
      case 'underwater': return 'Underwater';
      case 'nature': return 'Nature';
      case 'sunset': return 'Sunset';
      case 'wildlife': return 'Wildlife';
      case 'aerial': return 'Aerial';
      default: return 'General';
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
          src={admin?.portada_galeria || '/2.webp'}
          alt="Roatan Robert Tours Gallery"
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
              <span className="font-semibold">{galleryItems.length}</span> amazing photos from our adventures
            </div>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-4 text-center text-gray-600">
            Showing {galleryItems.length} photos
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {galleryItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No photos found
              </h3>
              <p className="text-gray-600 mb-6">There are no photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => {
                    // abrir lightbox con las imágenes de la fila
                    const imgs = (item as any).images || [item.image];
                    if (!imgs || imgs.length === 0) return;
                    setLightboxImages(imgs);
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                    document.body.style.overflow = 'hidden';
                  }}
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
                        {getCategoryLabel(item.category || 'general')}
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

      {/* Lightbox para imágenes de la fila */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
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
                  setLightboxIndex(i => Math.max(0, i - 1));
                }}
                className="absolute left-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1));
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
              src={lightboxImages[lightboxIndex]}
              alt={`Imagen ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Image Info (no title/desc available per-row here) */}
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
