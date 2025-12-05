import React, { useState, useEffect } from "react";
import { Play, Calendar, Users, Star } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import BookingModal from "./BookingModal";
import { useSupabaseSet } from "../hooks/supabaseset";

// Hero now reads admin.portada from Supabase when available

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const client = useSupabaseSet();
  const [admin, setAdmin] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client.from('admin').select('*').maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error('Error loading admin for hero:', err);
      }
    })();
    return () => { mounted = false; };
  }, [client]);

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "500+",
      label: "Aventureros Felices",
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: "4.9",
      label: "Calificación Promedio",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      value: "3+",
      label: "Años de Experiencia",
    },
  ];

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden pt-40 md:pt-56"
      style={{ height: "100vh" }}
    >
  {/* Background Image with Overlay */}
  <div className="absolute inset-0 z-0">
    <img
      src={'/images/hero.jpeg'}
      alt="Roatan Robert Tours"
      className="w-full h-full object-cover object-center"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-teal-900/40"></div>
  </div>


      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-teal-500/20 rounded-full animate-float"></div>
      <div
        className="absolute bottom-32 right-20 w-16 h-16 bg-blue-500/20 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/3 right-10 w-12 h-12 bg-green-500/20 rounded-full animate-float"
        style={{ animationDelay: "4s" }}
      ></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            {t.hero.title}
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl sm:text-2xl text-gray-200 mb-8 animate-fadeInUp"
            style={{ animationDelay: "0.4s" }}
          >
            {t.hero.subtitle}
          </p>

          {/* Description */}
          <p
            className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fadeInUp"
            style={{ animationDelay: "0.6s" }}
          >
            {t.hero.description}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fadeInUp"
            style={{ animationDelay: "0.8s" }}
          >
            <button
              onClick={() => setShowBookingModal(true)}
              className="group bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-teal-400 hover:to-blue-500"
            >
              <span className="flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                {t.hero.cta}
              </span>
            </button>

           
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fadeInUp"
            style={{ animationDelay: "1s" }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full text-teal-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* Video Modal */}
     
    </section>
  );
};

export default Hero;
