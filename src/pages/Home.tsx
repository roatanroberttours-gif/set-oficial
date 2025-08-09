import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Experiences from '../components/Experiences';
import Gallery from '../components/Gallery';
import Contact from '../components/Contact';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <Experiences />
      <Gallery />
      <Contact />
    </div>
  );
};

export default Home;
