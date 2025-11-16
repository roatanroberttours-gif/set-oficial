import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingSocial from './FloatingSocial';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 md:pt-32">
        <Outlet />
      </main>
      <Footer />
      <FloatingSocial />
    </div>
  );
};

export default Layout;
