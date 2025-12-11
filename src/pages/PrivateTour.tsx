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
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏝️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Private Tours Available
            </h3>
            <p className="text-gray-600">
              Check back soon for our exclusive private tours!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Image Gallery */}
                <div className="grid grid-cols-3 gap-1 h-64">
                  {tour.image1 && (
                    <div className="col-span-2 row-span-2 relative overflow-hidden">
                      <img
                        src={tour.image1}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {tour.image2 && (
                    <div className="relative overflow-hidden">
                      <img
                        src={tour.image2}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {tour.image3 && (
                    <div className="relative overflow-hidden">
                      <img
                        src={tour.image3}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {tour.title}
                  </h3>
                  <div
                    className="text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{ __html: formatTextToHtml(tour.description) }}
                  />

                  {/* Pricing Info */}
                  <div className="bg-teal-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-teal-600 mr-2" />
                      <span className="font-semibold text-gray-800">
                        Base Rates
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">1 Person:</span>
                        <span className="font-semibold">
                          ${tour.price_1_person}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">2 Persons:</span>
                        <span className="font-semibold">
                          ${tour.price_2_persons}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">3 Persons:</span>
                        <span className="font-semibold">
                          ${tour.price_3_persons}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">+4 Persons:</span>
                        <span className="font-semibold">
                          ${tour.price_4_persons}
                        </span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-600">
                          Children (under 5):
                        </span>
                        <span className="font-semibold">
                          ${tour.price_children_under_5}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  {tour.whats_included && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-teal-600 mr-2" />
                        <span className="font-semibold text-gray-800">
                          What's Included
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {tour.whats_included}
                      </p>
                    </div>
                  )}

                  {/* Duration */}
                  {tour.duration && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <Clock className="w-5 h-5 text-teal-600 mr-2" />
                      <span className="text-sm">{tour.duration}</span>
                    </div>
                  )}

                  {/* Tour Notes */}
                  {tour.tour_notes && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <p className="text-sm text-gray-700">{tour.tour_notes}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleStartAdventure(tour)}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    Start Your Adventure
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
