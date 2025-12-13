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
        {/* VIP Tours Section - transparent background */}
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Tour VIP</h2>
            <p className="text-white/90">
              Exclusive private tours — featured selection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vipTours.map((tour) => (
              <div
                key={tour.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all"
              >
                <div className="relative h-44">
                  <img
                    src={
                      tour.image1 ||
                      tour.image2 ||
                      tour.image3 ||
                      "/placeholder.jpg"
                    }
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
                  <div
                    className="text-gray-600 mb-4 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: formatTextToHtml(tour.description),
                    }}
                  />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-teal-600 font-semibold">
                      From ${tour.price_1_person}/person
                    </span>
                    <span className="text-gray-500 text-sm">
                      {tour.duration}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/private-tour/${tour.id}`}
                      className="flex-1 px-4 py-3 border border-teal-500 text-teal-600 rounded-lg text-center"
                    >
                      View Details
                    </Link>
                    {/* Book Now removed from VIP card */}
                  </div>
                </div>
              </div>
            ))}
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
