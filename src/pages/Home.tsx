import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Experiences from '../components/Experiences';
import Gallery from '../components/Gallery';
import Contact from '../components/Contact';
import TripAdvisorWidget from '../components/TripAdvisorWidget';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TripAdvisorWidget images={["/images/hero-mangrove-tour.jpg","/images/snorkeling-adventure.webp","/images/sunset-boat-tour.jpg"]} title="Best of Roatán" ctaHref="/contact" />
      </div>
      <Services />
      <Experiences />
      <Gallery />
      <Contact />
    </div>
  );
};

export default Home;
