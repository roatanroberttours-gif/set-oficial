import React, { useState, useEffect } from "react";
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/private-tour")}
          className="flex items-center text-white hover:text-teal-300 mb-6 transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Private Tours
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery - Carousel */}
          <div
            className="space-y-4"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${tour.title} ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out transform ${
                    selectedImage === idx
                      ? "opacity-100 z-10 scale-100"
                      : "opacity-0 z-0 scale-95"
                  }`}
                />
              ))}

              {/* Prev/Next Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (s) => (s - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-white transition-colors"
                    aria-label="Previous"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-white transition-colors"
                    aria-label="Next"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6l6 6-6 6"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-24 w-1/3 rounded-lg overflow-hidden transition-all transform ${
                      selectedImage === idx
                        ? "ring-4 ring-teal-500 scale-105"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${tour.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tour Details */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {tour.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {tour.description}
            </p>

            {/* Pricing */}
            <div className="bg-teal-50 rounded-xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <DollarSign className="w-6 h-6 text-teal-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">Base Rates</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700 font-medium">1 Person:</span>
                  <span className="text-teal-600 font-bold text-lg">
                    ${tour.price_1_person}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700 font-medium">2 Persons:</span>
                  <span className="text-teal-600 font-bold text-lg">
                    ${tour.price_2_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700 font-medium">3 Persons:</span>
                  <span className="text-teal-600 font-bold text-lg">
                    ${tour.price_3_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700 font-medium">+4 Persons:</span>
                  <span className="text-teal-600 font-bold text-lg">
                    ${tour.price_4_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg col-span-2">
                  <span className="text-gray-700 font-medium">
                    Children (under 5):
                  </span>
                  <span className="text-teal-600 font-bold text-lg">
                    ${tour.price_children_under_5}
                  </span>
                </div>
              </div>
            </div>

            {/* Duration */}
            {tour.duration && (
              <div className="flex items-center text-gray-700 mb-6 bg-blue-50 p-4 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <span className="font-semibold text-gray-800">Duration:</span>
                  <span className="ml-2">{tour.duration}</span>
                </div>
              </div>
            )}

            {/* What's Included */}
            {tour.whats_included && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    What's Included
                  </h3>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {tour.whats_included}
                  </p>
                </div>
              </div>
            )}

            {/* Tour Notes */}
            {tour.tour_notes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-gray-700 font-medium">
                  {tour.tour_notes}
                </p>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={() => navigate(`/private-tour/book/${tour.id}`)}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Book This Tour Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateTourDetail;
