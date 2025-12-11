import React, { useState, useEffect } from "react";
import { formatTextToHtml } from "../lib/formatText";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, DollarSign, CheckCircle, ArrowLeft, Users } from "lucide-react";
import { useSupabaseSet } from "../hooks/supabaseset";

interface PrivateTour {
  id: number;
  title: string;
  description: string;
  image1: string;
  image2: string;
  image3: string;
  price_1_person: number;
  price_2_persons: number;
  price_3_persons: number;
  price_4_persons: number;
  price_children_under_5: number;
  whats_included: string;
  duration: string;
  tour_notes: string;
  show_additional_options: boolean;
}

const PrivateTourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useSupabaseSet();
  const [tour, setTour] = useState<PrivateTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [paused, setPaused] = useState(false);

  // autoplay carousel
  useEffect(() => {
    if (!tour) return;
    const images = [tour.image1, tour.image2, tour.image3].filter(Boolean);
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      if (!paused) {
        setSelectedImage((i) => (i + 1) % images.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [tour, paused]);

  useEffect(() => {
    if (id) {
      loadTour(id);
    }
  }, [id]);

  const loadTour = async (tourId: string) => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from("private_tours")
        .select("*")
        .eq("id", Number(tourId))
        .single();

      if (error) throw error;
      setTour(data);
    } catch (error) {
      console.error("Error loading tour:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative z-10 py-20">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tour not found
          </h2>
          <p className="text-gray-600 mb-6">
            The tour you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/private-tour")}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  const images = [tour.image1, tour.image2, tour.image3].filter(Boolean);

  return (
    <div className="min-h-screen bg-transparent relative z-10 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/private-tour")}
          className="flex items-center text-white hover:text-teal-300 mb-8 transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Private Tours
        </button>

        {/* Hero Section with Title */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8 lg:p-10">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {tour.title}
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* Image Gallery - Full Width Carousel */}
        <div
          className="mb-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    selectedImage === idx
                      ? "opacity-100 z-10 scale-100"
                      : "opacity-0 z-0 scale-110"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${tour.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
                </div>
              ))}

              {/* Image Counter */}
              <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
                {selectedImage + 1} / {images.length}
              </div>

              {/* Prev/Next Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (s) => (s - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    aria-label="Previous"
                  >
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 18l-6-6 6-6"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() =>
                      setSelectedImage((s) => (s + 1) % images.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    aria-label="Next"
                  >
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6l6 6-6 6"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Indicator Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`transition-all rounded-full ${
                        selectedImage === idx
                          ? "w-8 h-2 bg-white"
                          : "w-2 h-2 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-32 rounded-xl overflow-hidden transition-all transform ${
                    selectedImage === idx
                      ? "ring-4 ring-teal-500 scale-105 shadow-lg"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${tour.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === idx && (
                    <div className="absolute inset-0 border-2 border-white/50"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-teal-600 to-blue-600 rounded-full mr-3"></span>
                About This Tour
              </h2>
              <div
                className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: formatTextToHtml(tour.description) }}
              />
            </div>

            {/* What's Included */}
            {tour.whats_included && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  What's Included
                </h2>
                <div className="bg-green-50 rounded-lg p-6">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                    {tour.whats_included}
                  </p>
                </div>
              </div>
            )}

            {/* Tour Notes */}
            {tour.tour_notes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-6 shadow-lg">
                <p className="text-gray-800 font-medium leading-relaxed">
                  <span className="font-bold text-yellow-800">Note: </span>
                  {tour.tour_notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar with Pricing & Booking */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing Card - Sticky */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:sticky lg:top-24">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <DollarSign className="w-6 h-6 text-teal-600 mr-2" />
                  Pricing
                </h3>
                {tour.duration && (
                  <div className="flex items-center text-gray-600 mt-3">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{tour.duration}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">1 Person</span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_1_person}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">2 Persons</span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_2_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">3 Persons</span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_3_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">4+ Persons</span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_4_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-300">
                  <span className="text-gray-600 text-sm font-medium">
                    Children (under 5)
                  </span>
                  <span className="text-gray-800 font-bold text-lg">
                    ${tour.price_children_under_5}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => navigate(`/private-tour/book/${tour.id}`)}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                Book This Tour Now
              </button>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                Instant confirmation • Free cancellation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateTourDetail;
