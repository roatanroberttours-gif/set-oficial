import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Experiences from "../components/Experiences";
import Gallery from "../components/Gallery";
import VideosSection from "../components/VideosSection";
import Contact from "../components/Contact";
import TripAdvisorWidget from "../components/TripAdvisorWidget";
import FacebookWidget from "../components/FacebookWidget";
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

  return (
    <div className="min-h-screen">
      <Hero />

      {/* VIP Tours Section - transparent background */}
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold">Tour VIP</h2>
            <p className="text-gray-500">
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
                  <div className="text-gray-600 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: formatTextToHtml(tour.description) }} />
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent">
          <TripAdvisorWidget
            images={[
              "/images/hero-mangrove-tour.jpg",
              "/images/snorkeling-adventure.webp",
              "/images/sunset-boat-tour.jpg",
            ]}
            title="Best of Roatán"
            ctaText="TripAdvisor"
            ctaHref="https://www.tripadvisor.com/Attraction_Review-g292019-d19846218-Reviews-Roatan_Robert_Tour-Roatan_Bay_Islands.html"
          />

          <FacebookWidget
            profileImage="/logo.webp"
            name="Roatan Robert Tours"
            followers="12.3k"
            likes="8.4k"
            info="Tours, snorkeling, and island adventures in Roatán. Contact us for private tours and group discounts."
            link="https://www.facebook.com/share/17UcBueTar/"
            images={[
              "https://scontent-gua1-1.xx.fbcdn.net/v/t39.30808-6/473619658_1180197186854935_6151835626484410998_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=GwTtiTWauLQQ7kNvwFdN65w&_nc_oc=AdndoO4lEb-VXycDXe8Mq-taQVyxZbpX67NhGqVD3K8ZqE-cwAP6cNNGQK-tExfONGLjdp4LT3oHmg9MO0zkeOuH&_nc_zt=23&_nc_ht=scontent-gua1-1.xx&_nc_gid=8FJRCGrFL6wwejbo0i3kiw&oh=00_Afi8eLN-BSDMR1spwCLcxqOwVBBOIHQbz3M11-NUny4jVQ&oe=691FBE82",
              "https://scontent-gua1-1.xx.fbcdn.net/v/t39.30808-6/475783064_948523607417191_6398679110474697125_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2DvXC7yJQcwQ7kNvwGfOTq8&_nc_oc=AdndOHqJ1CMbM74XyFr5AZklPuaLAqn_NXqdKNqe0J2ioTyLZkQ8Nn02zpWqNjiCVdMBgB1woJFFuOxDfjzrserp&_nc_zt=23&_nc_ht=scontent-gua1-1.xx&_nc_gid=1FIWIQPgXocwg5c0Ezyg3Q&oh=00_AfjNABlKGjmXUn0GWzJpt3QsBKyaXoswQQvnNFt7TAZH8w&oe=691FC4EC",
              "https://scontent-gua1-1.xx.fbcdn.net/v/t39.30808-6/475785953_948523214083897_1279743254271036678_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=5H2VPSPoc_kQ7kNvwHYaGkS&_nc_oc=Adk-BkRrKXADwXnC5fqaH1GdmQMPM_XWsFxDtzeakkk3aeV14rg-lUgi1EaSRWIJys_Fw9g3r0x2sw_w4QWoQJmJ&_nc_zt=23&_nc_ht=scontent-gua1-1.xx&_nc_gid=UIZ9bEWMyQ73CUJoOF9CqA&oh=00_Afi8hRMxqFY8FjFiv9rbBGbN6dsJ496BklmXfqCdjAkE_w&oe=691FB972",
            ]}
          />
        </div>
      </div>
      <Services />
      <Experiences />
      <Gallery />
      <VideosSection />
      <Contact />
    </div>
  );
};

export default Home;
