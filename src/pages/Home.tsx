import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Experiences from "../components/Experiences";
import Gallery from "../components/Gallery";
import VideosSection from "../components/VideosSection";
import Contact from "../components/Contact";
// Elfsight embed will replace TripAdvisor and Facebook widgets
import { useSupabaseSet } from "../hooks/supabaseset";
import { formatTextToHtml } from "../lib/formatText";

const Home: React.FC = () => {
  const client = useSupabaseSet();
  const [vipTours, setVipTours] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client
          .from("private_tours")
          .select("*")
          .order("id", { ascending: true })
          .limit(2);
        if (error) throw error;
        if (mounted) setVipTours(data || []);
      } catch (err) {
        console.error("Error loading VIP tours:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);

  // Load Elfsight platform script once for the All-in-One Reviews embed
  useEffect(() => {
    const src = "https://elfsightcdn.com/platform.js";
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="min-h-screen">
      <Hero />

    

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent">
          {/* Elfsight All-in-One Reviews embed (replaces TripAdvisor + Facebook cards) */}
          <div className="md:col-span-2 w-full">
            <div
              className="elfsight-app-75732b76-fa2d-4b66-9302-28cb2c4441cf w-full"
              data-elfsight-app-lazy
            />
          </div>
        </div>
      </div>
        {/* VIP Tours Section - Enhanced Premium Design */}
      <section className="py-16 bg-transparent relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                ⭐ Exclusive VIP Experience
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              Premium Private Tours
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover paradise with our handpicked luxury experiences — limited availability
            </p>
          </div>

          {/* VIP Tour Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {vipTours.map((tour, index) => (
              <div
                key={tour.id}
                className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden transform hover:-translate-y-3 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* VIP Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <span>👑</span>
                    <span>VIP EXCLUSIVE</span>
                  </div>
                </div>

                {/* Duration Badge */}
                {tour.duration && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{tour.duration}</span>
                    </div>
                  </div>
                )}

                {/* Image with Overlay */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={
                      tour.image1 ||
                      tour.image2 ||
                      tour.image3 ||
                      "/placeholder.jpg"
                    }
                    alt={tour.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Floating Price Tag */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Starting from</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                            ${tour.price_1_person}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">per person</p>
                        </div>
                        <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-full p-3 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                    {tour.title}
                  </h3>
                  
                  <div
                    className="text-gray-600 mb-5 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatTextToHtml(tour.description),
                    }}
                  />

                  {/* Features/Highlights */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
                      <span>🌊</span> Beach Access
                    </span>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                      <span>📸</span> Photo Spots
                    </span>
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                      <span>🎯</span> Private Guide
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/private-tour/${tour.id}`}
                    className="block w-full text-center px-6 py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>Explore This Adventure</span>
                      <span className="text-xl">→</span>
                    </span>
                  </Link>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-bl-[100px] pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-white/80 text-lg mb-4">
              Can't find what you're looking for?
            </p>
            <Link
              to="/private-tour"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full border-2 border-white/30 transition-all duration-300 hover:scale-105"
            >
              <span>View All Private Tours</span>
              <span className="text-xl">✨</span>
            </Link>
          </div>
        </div>
      </section>
      <Services />
      <Experiences />
      <Gallery />
      <VideosSection />
      <Contact />
    </div>
  );
};

export default Home;
