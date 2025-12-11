import React, { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Experience } from "../types";
import { getExperiences } from "../services/googleSheets";

const Experiences: React.FC = () => {
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => {
    if (experiences.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % experiences.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [experiences.length]);

  const loadExperiences = async () => {
    try {
      const experiencesData = await getExperiences();
      setExperiences(experiencesData);
    } catch (error) {
      console.error("Error loading experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + experiences.length) % experiences.length
    );
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section
        className="py-20 bg-transparent relative z-10"
        style={{ backgroundColor: "transparent", backgroundImage: "none" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse bg-transparent backdrop-blur-sm rounded-2xl shadow-none p-8">
              <div className="h-32 bg-gray-200/30 rounded mb-4"></div>
              <div className="h-6 bg-gray-200/30 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  const currentExperience = experiences[currentIndex];

  return (
    <section
      id="experiences"
      className="py-20 bg-transparent relative z-10"
      style={{ backgroundColor: "transparent", backgroundImage: "none" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.experiences.title}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {t.experiences.subtitle}
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-transparent rounded-2xl shadow-none overflow-hidden">
            <div className="relative h-64 sm:h-80">
              <img
                src={currentExperience.image}
                alt={currentExperience.title}
                className="w-full h-full object-cover opacity-0 pointer-events-none"
              />
              <div className="absolute inset-0 bg-transparent"></div>
            </div>

            <div className="p-8 relative">
              {/* Quote Icon */}
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-6 mt-4">
                <div className="flex space-x-1">
                  {renderStars(currentExperience.rating || 5)}
                </div>
              </div>

              {/* Testimonial */}
              <blockquote className="text-center mb-8">
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 italic">
                  "
                  {currentExperience.testimonial ||
                    currentExperience.description}
                  "
                </p>
                <footer>
                  <cite className="text-gray-500 font-medium not-italic">
                    — {currentExperience.author || "Cliente Satisfecho"}
                  </cite>
                </footer>
              </blockquote>

              {/* Navigation */}
              {experiences.length > 1 && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    aria-label="Testimonio anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex space-x-2">
                    {experiences.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                          index === currentIndex ? "bg-teal-500" : "bg-gray-300"
                        }`}
                        aria-label={`Ir al testimonio ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    aria-label="Siguiente testimonio"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Background Decorations */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full opacity-50 animate-float"></div>
          <div
            className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-50 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {[
            { number: "500+", label: "Aventureros Felices" },
            { number: "4.9/5", label: "Calificación Promedio" },
            { number: "100%", label: "Satisfacción Garantizada" },
            { number: "3+", label: "Años de Experiencia" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experiences;
