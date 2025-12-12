import React, { useState, useEffect } from "react";
import { formatTextToHtml } from "../lib/formatText";
import { Clock, DollarSign, Users, CheckCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useSupabaseSet } from "../hooks/supabaseset";
import { useNavigate } from "react-router-dom";

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

const PrivateTour: React.FC = () => {
  const { t } = useLanguage();
  const client = useSupabaseSet();
  const navigate = useNavigate();
  const [tours, setTours] = useState<PrivateTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from("private_tours")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error("Error loading private tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAdventure = (tour: PrivateTour) => {
    navigate(`/private-tour/${tour.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-transparent relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Private Tours
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience Roatán with a private, customizable tour. Perfect for
            families, couples, and groups who want a personalized adventure.
          </p>
        </div>

        {/* Tours Grid */}
        {tours.length === 0 ? (
          <div className="text-center py-16 animate-fadeInUp">
            <div className="text-6xl mb-4">🏝️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Private Tours Available
            </h3>
            <p className="text-gray-600">
              Check back soon for our exclusive private tours!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {tours.map((tour, index) => (
              <div
                key={tour.id}
                className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:bg-white transition-all duration-500 border border-white/20 animate-fadeInUp"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Image Gallery */}
                <div className="grid grid-cols-3 gap-1 h-72 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                  {tour.image1 && (
                    <div className="col-span-2 row-span-2 relative overflow-hidden">
                      <img
                        src={tour.image1}
                        alt={tour.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>
                  )}
                  {tour.image2 && (
                    <div className="relative overflow-hidden">
                      <img
                        src={tour.image2}
                        alt={tour.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out delay-75"
                      />
                    </div>
                  )}
                  {tour.image3 && (
                    <div className="relative overflow-hidden">
                      <img
                        src={tour.image3}
                        alt={tour.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out delay-150"
                      />
                    </div>
                  )}

                  {/* Title overlay on image for mobile or just visual flair */}
                  <div className="absolute bottom-4 left-6 z-20 md:hidden">
                    <h3 className="text-2xl font-bold text-white shadow-sm">
                      {tour.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 relative">
                  <div className="hidden md:block">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-teal-600 transition-colors">
                      {tour.title}
                    </h3>
                  </div>

                  <div className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                    {tour.description.length > 150
                      ? `${tour.description.substring(0, 150)}...`
                      : tour.description}
                  </div>

                  {/* Pricing Info - Modern Pill Design */}
                  <div className="bg-gradient-to-br from-gray-50 to-teal-50/50 rounded-2xl p-6 mb-6 border border-teal-100/50">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-teal-100 rounded-lg mr-3">
                        <DollarSign className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="font-bold text-gray-800 text-lg">
                        Base Rates
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">1-2 Persons</span>
                        <div className="flex gap-4">
                          <div className="text-right">
                            <span className="block text-xs text-gray-400">1 Person</span>
                            <span className="font-bold text-gray-900">${tour.price_1_person}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs text-gray-400">2 Persons</span>
                            <span className="font-bold text-gray-900">${tour.price_2_persons}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">Groups</span>
                        <div className="flex gap-4">
                          <div className="text-right">
                            <span className="block text-xs text-gray-400">3 Persons</span>
                            <span className="font-bold text-gray-900">${tour.price_3_persons}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs text-gray-400">+4 Persons</span>
                            <span className="font-bold text-gray-900">${tour.price_4_persons}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {tour.whats_included && (
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-teal-500 mr-2 mt-0.5" />
                        <div>
                          <span className="block font-semibold text-gray-900 text-sm mb-1">Includes</span>
                          <span className="text-xs text-gray-500 line-clamp-2">{tour.whats_included}</span>
                        </div>
                      </div>
                    )}
                    {tour.duration && (
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-teal-500 mr-2 mt-0.5" />
                        <div>
                          <span className="block font-semibold text-gray-900 text-sm mb-1">Duration</span>
                          <span className="text-xs text-gray-500">{tour.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleStartAdventure(tour)}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-teal-600 transition-all duration-300 transform group-hover:-translate-y-1 shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                  >
                    <span>Start Your Adventure</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need a Custom Experience?</h3>
          <p className="text-lg mb-6">
            Tell us what you want to see and do — our team will craft a private
            tour that fits your schedule and interests.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivateTour;
