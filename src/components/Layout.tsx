import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingSocial from "./FloatingSocial";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fondo de video fijo para toda la página (excepto footer estará encima naturalmente) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          src="/video/v2.mp4"
          className="w-full h-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      <Header />
      <main className="flex-1 pt-28 md:pt-32 bg-transparent relative z-10">
        <Outlet />
      </main>
      <Footer />
      <FloatingSocial />
    </div>
  );
};

export default Layout;
