import React, { useState, useEffect, useRef } from "react";
import { Play, Calendar, Users, Star } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import BookingModal from "./BookingModal";

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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

  // Lista de imágenes servidas desde `public/images`
  const images = [
    
    '/images/roatan-paradise.jpg',
    '/images/snorkeling-adventure.webp',
    '/images/sunset-boat-tour.jpg',
      '/images/pop.avif',
          '/images/pos.webp',
        

  
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimer = useRef<number | null>(null);
  const AUTOPLAY_MS = 5000;

  const nextHero = () => setHeroIndex((i) => (images.length ? (i + 1) % images.length : 0));
  const prevHero = () => setHeroIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));

  useEffect(() => {
    if (!images || images.length === 0) return;
    if (heroTimer.current) window.clearInterval(heroTimer.current);
    heroTimer.current = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % images.length);
    }, AUTOPLAY_MS) as unknown as number;
    return () => {
      if (heroTimer.current) window.clearInterval(heroTimer.current);
    };
  }, [images]);

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden pt-40 md:pt-56"
      style={{ height: "100vh" }}
    >
  {/* Background Image Carousel with Overlay */}
  <div className="absolute inset-0 z-0">
    <img
      src={images[heroIndex]}
      alt={`Roatan Robert Tours ${heroIndex + 1}`}
      className="w-full h-full object-cover object-center"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-teal-900/40"></div>

    {/* Controls */}
    {images.length > 1 && (
      <>
        <button
          aria-label="Previous background"
          onClick={prevHero}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ‹
        </button>
        <button
          aria-label="Next background"
          onClick={nextHero}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ›
        </button>

        {/* Indicators */}
        <div className="absolute left-1/2 bottom-6 transform -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to background ${i + 1}`}
              onClick={() => setHeroIndex(i)}
              className={`w-3 h-3 rounded-full ${i === heroIndex ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </>
    )}
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
