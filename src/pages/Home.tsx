import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Experiences from '../components/Experiences';
import Gallery from '../components/Gallery';
import Contact from '../components/Contact';
import TripAdvisorWidget from '../components/TripAdvisorWidget';
import FacebookWidget from '../components/FacebookWidget';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TripAdvisorWidget
            images={["/images/hero-mangrove-tour.jpg","/images/snorkeling-adventure.webp","/images/sunset-boat-tour.jpg"]}
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
              'https://scontent-gua1-1.xx.fbcdn.net/v/t39.30808-6/473619658_1180197186854935_6151835626484410998_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=GwTtiTWauLQQ7kNvwFdN65w&_nc_oc=AdndoO4lEb-VXycDXe8Mq-taQVyxZbpX67NhGqVD3K8ZqE-cwAP6cNNGQK-tExfONGLjdp4LT3oHmg9MO0zkeOuH&_nc_zt=23&_nc_ht=scontent-gua1-1.xx&_nc_gid=8FJRCGrFL6wwejbo0i3kiw&oh=00_Afi8eLN-BSDMR1spwCLcxqOwVBBOIHQbz3M11-NUny4jVQ&oe=691FBE82',
              'https://scontent-gua1-1.xx.fbcdn.net/v/t39.30808-6/475783064_948523607417191_6398679110474697125_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2DvXC7yJQcwQ7kNvwGfOTq8&_nc_oc=AdndOHqJ1CMbM74XyFr5AZklPuaLAqn_NXqdKNqe0J2ioTyLZkQ8Nn02zpWqNjiCVdMBgB1woJFFuOxDfjzrserp&_nc_zt=23&_nc_ht=scontent-gua1-1.xx&_nc_gid=1FIWIQPgXocwg5c0Ezyg3Q&oh=00_AfjNABlKGjmXUn0GWzJpt3QsBKyaXoswQQvnNFt7TAZH8w&oe=691FC4EC',
              'https://scontent-gua1-1.xx.fbcdn.net/v/t39.30808-6/475785953_948523214083897_1279743254271036678_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=5H2VPSPoc_kQ7kNvwHYaGkS&_nc_oc=Adk-BkRrKXADwXnC5fqaH1GdmQMPM_XWsFxDtzeakkk3aeV14rg-lUgi1EaSRWIJys_Fw9g3r0x2sw_w4QWoQJmJ&_nc_zt=23&_nc_ht=scontent-gua1-1.xx&_nc_gid=UIZ9bEWMyQ73CUJoOF9CqA&oh=00_Afi8hRMxqFY8FjFiv9rbBGbN6dsJ496BklmXfqCdjAkE_w&oe=691FB972',
            ]}
          />
        </div>
      </div>
      <Services />
      <Experiences />
      <Gallery />
      <Contact />
    </div>
  );
};

export default Home;
