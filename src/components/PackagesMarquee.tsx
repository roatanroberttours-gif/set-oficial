import React, { useEffect, useState, useRef } from "react";
import { useSupabaseSet } from "../hooks/supabaseset";

const PackagesMarquee: React.FC<{ client?: any }> = ({ client }) => {
  const clientRef = client ?? useSupabaseSet();
  const [packages, setPackages] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [jsActive, setJsActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await clientRef
          .from("paquetes")
          .select("*")
          .order("id", { ascending: true });
        if (error) throw error;
        if (mounted) setPackages(data || []);
      } catch (err) {
        console.error("Error loading paquetes for marquee:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [clientRef]);

  // JS-driven infinite scroll for mobile devices
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const mq = window.matchMedia('(max-width: 768px)');
    if (!mq.matches) {
      setJsActive(false);
      return;
    }

    setJsActive(true);

    // ensure wrapper is scrolled a little to initialize
    wrapper.scrollLeft = 0;

    let rafId: number | null = null;
    const speed = 0.6; // px per frame, tweakable

    const step = () => {
      if (!wrapper || !track) return;
      const half = track.scrollWidth / 2;
      wrapper.scrollLeft += speed;
      if (wrapper.scrollLeft >= half) {
        // seamless reset
        wrapper.scrollLeft -= half;
      }
      rafId = requestAnimationFrame(step);
    };

    const start = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(step);
    };
    const stop = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const onInteraction = () => stop();
    wrapper.addEventListener('touchstart', onInteraction, { passive: true });
    wrapper.addEventListener('pointerdown', onInteraction);

    start();

    const onResize = () => {
      if (!window.matchMedia('(max-width: 768px)').matches) {
        stop();
        setJsActive(false);
      } else {
        setJsActive(true);
        start();
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      stop();
      wrapper.removeEventListener('touchstart', onInteraction);
      wrapper.removeEventListener('pointerdown', onInteraction);
      window.removeEventListener('resize', onResize);
      setJsActive(false);
    };
  }, [packages]);

  if (!packages || packages.length === 0) return null;

  // duplicate to create seamless infinite scroll
  const items = [...packages, ...packages];

  return (
    <section className="mb-8">
      <style>{`
        .marquee-wrapper { overflow: hidden; }
        .marquee-track { display: flex; gap: 1rem; align-items: stretch; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-animate { animation: marquee 30s linear infinite; }
        /* Mobile: use JS-driven smooth scroll for a true infinite effect; make items responsive */
        @media (max-width: 768px) {
          .marquee-track { gap: 0.5rem; }
          .marquee-wrapper { padding-left: 0.5rem; padding-right: 0.5rem; }
          .marquee-track > div { width: calc(72vw); flex: 0 0 auto; }
          .marquee-track > div .h-40 { height: calc(48vw); }
          /* When JS takes control we disable the CSS animation and allow horizontal scrolling */
          .js-active .marquee-track { animation: none !important; }
          .js-active .marquee-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
        /* Keep animating when hovered */
        .marquee-animate:hover { animation-play-state: running !important; }

        /* Pricing badge animation: visible pill with pulsing appearance */
        .pricing-badge {
          display: inline-block;
          color: #ffffff;
          background: rgba(0,0,0,0.45);
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          opacity: 0;
          transform: translateY(6px) scale(0.98);
          z-index: 20;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          animation: pricingIn 2.4s cubic-bezier(.2,.9,.2,1) infinite;
        }

        @keyframes pricingIn {
          0% { opacity: 0; transform: translateY(6px) scale(0.98); }
          12% { opacity: 1; transform: translateY(0) scale(1); }
          60% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-6px) scale(0.98); }
        }
      `}</style>

      <div ref={wrapperRef} className={`marquee-wrapper ${jsActive ? 'js-active' : ''}`}>
        <div ref={trackRef} className="marquee-track marquee-animate">
          {items.map((pkg, idx) => (
            <div
              key={`${pkg.id}-${idx}`}
              className="w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md relative"
            >
              <div className="h-40 w-full overflow-hidden relative">
                <img
                  src={pkg.imagen1 || pkg.imagen || pkg.image || pkg.image1}
                  alt={pkg.titulo || pkg.title}
                  className="w-full h-full object-cover"
                />

                {/* Dark gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {/* Overlay text: title small, price prominent */}
                <div className="absolute left-0 right-0 bottom-0 p-3">
                  <div className="text-xs text-white truncate">
                    {pkg.titulo || pkg.title}
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <div
                      className="pricing-badge"
                      style={{
                        animationDelay: `${
                          (idx % (packages.length || 1)) * 0.45
                        }s`,
                      }}
                    >
                      Pricing
                    </div>
                    <div className="text-teal-300 font-extrabold text-xl">
                      ${(pkg.precio_por_persona ?? pkg.price ?? 0).toString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* JS infinite scroll on mobile */}
    </section>
  );
};

export default PackagesMarquee;

