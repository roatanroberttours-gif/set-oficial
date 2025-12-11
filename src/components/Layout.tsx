import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingSocial from "./FloatingSocial";
import { useSupabaseSet } from "../hooks/supabaseset";

const Layout: React.FC = () => {
  const client = useSupabaseSet();
  const [videoUrl, setVideoUrl] = useState<string>("/video/v2.mp4"); // fallback to static video

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client
          .from("admin")
          .select("video_principal")
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (mounted && data?.video_principal) {
          setVideoUrl(data.video_principal);
        }
      } catch (err) {
        console.error("Error loading main video:", err);
        // Keep fallback video
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fondo de video fijo para toda la página (excepto footer estará encima naturalmente) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          key={videoUrl}
          src={videoUrl}
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
