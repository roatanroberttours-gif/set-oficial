import React, { useState, useEffect } from "react";
import { formatTextToHtml } from "../lib/formatText";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, DollarSign, CheckCircle, ArrowLeft, Users } from "lucide-react";
import PackagesMarquee from "../components/PackagesMarquee";
import PolicyConfirmModal from "../components/PolicyConfirmModal";
import { useSupabaseSet } from "../hooks/supabaseset";

interface PrivateTour {
  id: number;
  title: string;
  description: string;
  image1: string;
  image2: string;
  image3: string;
  price_1_person: number;
  price_2_persons: number;
  price_3_persons: number;
  price_4_persons: number;
  price_children_under_5: number;
  whats_included: string;
  duration: string;
  tour_notes: string;
  show_additional_options: boolean;
  available_days?: string[];
  activity_1?: string;
  activity_2?: string;
  activity_3?: string;
  activity_4?: string;
  summary?: string;
}

const PrivateTourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useSupabaseSet();
  const [tour, setTour] = useState<PrivateTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);

  // autoplay carousel
  useEffect(() => {
    if (!tour) return;
    const images = [tour.image1, tour.image2, tour.image3].filter(Boolean);
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      if (!paused) {
        setSelectedImage((i) => (i + 1) % images.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tour, paused]);

  // auto-scroll panel slowly on mobile
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const mq = window.matchMedia("(max-width: 768px)");
    if (!mq.matches) return; // only on small screens

    let rafId: number | null = null;
    let direction = 1;
    const speed = 0.35; // px per frame (slightly faster)

    const step = () => {
      if (!panel) return;
      const maxScroll = panel.scrollHeight - panel.clientHeight;

      if (maxScroll <= 0) {
        // fallback: animate inner content translateY slightly to simulate motion
        const inner = innerRef.current;
        if (!inner) {
          rafId = requestAnimationFrame(step);
          return;
        }
        const maxTranslate = 10; // px
        const current = Number(inner.style.getPropertyValue("--ty") || 0);
        let next = current + direction * 0.15; // smaller step
        if (next >= maxTranslate) direction = -1;
        else if (next <= -maxTranslate) direction = 1;
        inner.style.setProperty("--ty", `${next}`);
        inner.style.transform = `translateY(${next}px)`;
        rafId = requestAnimationFrame(step);
        return;
      }

      panel.scrollTop = Math.min(
        Math.max(panel.scrollTop + direction * speed, 0),
        maxScroll
      );

      if (panel.scrollTop >= maxScroll - 0.5) direction = -1;
      else if (panel.scrollTop <= 0.5) direction = 1;

      rafId = requestAnimationFrame(step);
    };

    const start = () => {
      if (rafId != null) return;
      // small delay before starting
      setTimeout(() => {
        rafId = requestAnimationFrame(step);
      }, 800);
    };

    const stop = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const onInteraction = () => stop();
    const onResize = () => {
      if (window.matchMedia("(max-width: 768px)").matches) start();
      else stop();
    };

    panel.addEventListener("touchstart", onInteraction, { passive: true });
    panel.addEventListener("pointerdown", onInteraction);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    start();

    return () => {
      stop();
      panel.removeEventListener("touchstart", onInteraction);
      panel.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [tour, selectedImage]);

  useEffect(() => {
    if (id) {
      loadTour(id);
    }
  }, [id]);

  const loadTour = async (tourId: string) => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from("private_tours")
        .select("*")
        .eq("id", Number(tourId))
        .single();

      if (error) throw error;
      setTour(data);
    } catch (error) {
      console.error("Error loading tour:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative z-10 py-20">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tour not found
          </h2>
          <p className="text-gray-600 mb-6">
            The tour you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/private-tour")}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  const images = [tour.image1, tour.image2, tour.image3].filter(Boolean);

  return (
    <div className="min-h-screen bg-transparent relative z-10 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/private-tour")}
          className="flex items-center text-white hover:text-teal-300 mb-8 transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Private Tours
        </button>

        {/* Hero Section removed: title now shown inside the carousel overlay */}

        {/* Image Gallery - Full Width Carousel */}
        <div
          className="mb-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
            <style>{`
                /* Top-right panel constrained to the image area */
                .pricing-panel {
                  background: linear-gradient(90deg, rgba(2,6,23,0.92), rgba(2,6,23,0.6));
                  color: #fff;
                  padding: 0.9rem 1rem;
                  border-radius: 0.8rem;
                  width: 20rem; /* preferred width */
                  max-width: calc(100% - 2rem);
                  /* Keep the panel within the image height */
                  max-height: calc(100% - 3rem);
                  overflow-y: auto;
                  opacity: 0;
                  transform: translateY(-6px) scale(0.995);
                  box-shadow: 0 20px 40px rgba(2,6,23,0.5);
                }
                .pricing-animate { animation: pricingAppear 680ms cubic-bezier(.2,.9,.2,1) forwards; }
                @keyframes pricingAppear { from { opacity: 0; transform: translateX(14px) scale(0.995); } to { opacity: 1; transform: translateX(0) scale(1); } }

                .pricing-lines { display: flex; flex-direction: column; gap: 8px; }
                .pricing-panel::-webkit-scrollbar { width: 10px; }
                .pricing-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 8px; }
                .pricing-panel { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
                .pricing-line { opacity: 0; transform: translateX(10px); }
                .pricing-line.show { animation: lineIn 420ms cubic-bezier(.2,.9,.2,1) forwards; }
                @keyframes lineIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }

                /* Larger typography inside panel */
                .pricing-panel .title { font-size: 16px; font-weight: 700; }
                .pricing-panel .duration { font-size: 13px; color: #e6eef6; }
                .pricing-panel .line-label { font-size: 15px; color: #f0f9ff; }
                .pricing-panel .line-price { font-size: 17px; font-weight: 800; color: #7ee3c6; }
                /* Carousel title overlay - centered, large, animated in/out */
                .carousel-title { 
                  max-width: 72%;
                  padding: 0.25rem 0.5rem;
                  pointer-events: none;
                  opacity: 0;
                  transform: translateY(-12px) scale(0.98);
                  transition: opacity 420ms cubic-bezier(.2,.9,.2,1), transform 420ms cubic-bezier(.2,.9,.2,1);
                }
                .carousel-title .title-large { font-size: 28px; font-weight: 800; color: #ffffff; text-shadow: 0 10px 30px rgba(2,6,23,0.7); line-height: 1; }
                .carousel-title.show { opacity: 1; transform: translateY(0) scale(1); }
                @media (min-width: 768px) { .carousel-title .title-large { font-size: 48px; } }
                @media (min-width: 1024px) { .carousel-title .title-large { font-size: 64px; } }

                /* Responsive adjustments: place panel at bottom and full-width on small screens
                   Add a small scroll-indicator above the panel to hint that it is scrollable */
                .scroll-indicator { display: none; }
                @media (max-width: 768px) {
                  .pricing-panel {
                    position: absolute !important;
                    left: 1rem !important;
                    right: 1rem !important;
                    top: auto !important;
                    bottom: 1rem !important;
                    transform: none !important;
                    width: calc(100% - 2rem) !important;
                    max-height: 45%;
                    padding-top: 1.1rem;
                  }
                  .scroll-indicator {
                    display: block;
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 44px;
                    height: 6px;
                    border-radius: 999px;
                    background: rgba(255,255,255,0.12);
                    box-shadow: 0 6px 12px rgba(2,6,23,0.25);
                    pointer-events: none;
                    z-index: 40;
                    animation: scrollHint 1400ms ease-in-out infinite;
                  }
                  .scroll-indicator::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 12px;
                    height: 12px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06));
                    clip-path: polygon(50% 70%, 15% 30%, 85% 30%);
                    opacity: 0.9;
                  }
                  @keyframes scrollHint { 0% { transform: translateX(-50%) translateY(0); opacity: 0.9 } 50% { transform: translateX(-50%) translateY(4px); opacity: 0.6 } 100% { transform: translateX(-50%) translateY(0); opacity: 0.9 } }
                }
              `}</style>
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  selectedImage === idx
                    ? "opacity-100 z-10 scale-100"
                    : "opacity-0 z-0 scale-110"
                }`}
              >
                <img
                  src={img}
                  alt={`${tour.title} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>

                {/* Dynamic panel based on image index */}
                {selectedImage === idx && (
                  <div
                    ref={panelRef}
                    className={`absolute right-6 top-6 z-30 pricing-panel pricing-animate`}
                  >
                    {/* Scroll hint for mobile: visible only on small screens via CSS */}
                    <div className="scroll-indicator" aria-hidden="true" />
                    <div ref={innerRef} className="panel-inner">
                      {/* Image 1: Activities */}
                      {idx === 0 && (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="title">What Will We Do?</div>
                            {tour.duration && (
                              <div className="duration">{tour.duration}</div>
                            )}
                          </div>
                          <div className="pricing-lines">
                            {[
                              tour.activity_1,
                              tour.activity_2,
                              tour.activity_3,
                              tour.activity_4,
                            ]
                              .filter(Boolean)
                              .map((activity, i) => (
                                <div
                                  key={i}
                                  className={`pricing-line show`}
                                  style={{
                                    animationDelay: `${(i + 1) * 0.12}s`,
                                  }}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-teal-400 font-bold">
                                      {i + 1}.
                                    </span>
                                    <div className="line-label flex-1">
                                      {activity}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}

                      {/* Image 2: Summary */}
                      {idx === 1 && tour.summary && (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="title">Summary</div>
                            {tour.duration && (
                              <div className="duration">{tour.duration}</div>
                            )}
                          </div>
                          <div className="pricing-lines">
                            <div className="pricing-line show text-sm leading-relaxed">
                              {tour.summary}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Image 3: Pricing */}
                      {idx === 2 && (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="title">Pricing</div>
                            {tour.duration && (
                              <div className="duration">{tour.duration}</div>
                            )}
                          </div>
                          <div className="pricing-lines">
                            <div
                              className={`pricing-line show`}
                              style={{ animationDelay: `0.12s` }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="line-label">1 Person</div>
                                <div className="line-price">
                                  ${tour.price_1_person}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`pricing-line show`}
                              style={{ animationDelay: `0.24s` }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="line-label">2 Persons</div>
                                <div className="line-price">
                                  ${tour.price_2_persons}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`pricing-line show`}
                              style={{ animationDelay: `0.36s` }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="line-label">3 Persons</div>
                                <div className="line-price">
                                  ${tour.price_3_persons}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`pricing-line show`}
                              style={{ animationDelay: `0.48s` }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="line-label">4+ Persons</div>
                                <div className="line-price">
                                  ${tour.price_4_persons}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`pricing-line show`}
                              style={{ animationDelay: `0.6s` }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="line-label">
                                  Children (under 5)
                                </div>
                                <div className="line-price">
                                  ${tour.price_children_under_5}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Title overlay shown when this image is active */}
                {selectedImage === idx && (
                  <div className="absolute top-6 left-6 z-40 carousel-title show text-left">
                    <h2 className="title-large text-2xl md:text-3xl lg:text-4xl">
                      {tour.title}
                    </h2>
                  </div>
                )}
              </div>
            ))}

            {/* Image Counter */}
            <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
              {selectedImage + 1} / {images.length}
            </div>

            {/* Prev/Next Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage(
                      (s) => (s - 1 + images.length) % images.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
                  aria-label="Previous"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 18l-6-6 6-6"
                    />
                  </svg>
                </button>

                <button
                  onClick={() =>
                    setSelectedImage((s) => (s + 1) % images.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
                  aria-label="Next"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 6l6 6-6 6"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Indicator Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`transition-all rounded-full ${
                      selectedImage === idx
                        ? "w-8 h-2 bg-white"
                        : "w-2 h-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Images removed to save space */}
        </div>

        {/* Continuous Packages Carousel (infinite horizontal row) */}
        <PackagesMarquee client={client} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Days */}
            {tour.available_days && tour.available_days.length > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-teal-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📅</span>
                  Available Days
                </h3>
                <div className="flex flex-wrap gap-3">
                  {tour.available_days.map((day) => (
                    <span
                      key={day}
                      className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-semibold text-teal-700 shadow-sm border border-teal-200"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-teal-600 to-blue-600 rounded-full mr-3"></span>
                About This Tour
              </h2>
              <div
                className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatTextToHtml(tour.description),
                }}
              />
            </div>

            {/* What's Included */}
            {tour.whats_included && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  What's Included
                </h2>
                <div className="bg-green-50 rounded-lg p-6">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                    {tour.whats_included}
                  </p>
                </div>
              </div>
            )}

            {/* Tour Notes */}
            {tour.tour_notes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-6 shadow-lg">
                <p className="text-gray-800 font-medium leading-relaxed">
                  <span className="font-bold text-yellow-800">Note: </span>
                  {tour.tour_notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar with Pricing & Booking */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing Card - Sticky */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:sticky lg:top-24">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <DollarSign className="w-6 h-6 text-teal-600 mr-2" />
                  Pricing
                </h3>
                {tour.duration && (
                  <div className="flex items-center text-gray-600 mt-3">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{tour.duration}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">1 Person</span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_1_person}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">2 Persons</span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_2_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">3 Persons</span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_3_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">
                      4+ Persons
                    </span>
                  </div>
                  <span className="text-teal-600 font-bold text-xl">
                    ${tour.price_4_persons}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-300">
                  <span className="text-gray-600 text-sm font-medium">
                    Children (under 5)
                  </span>
                  <span className="text-gray-800 font-bold text-lg">
                    ${tour.price_children_under_5}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => setPolicyOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                Book This Tour Now
              </button>

              <PolicyConfirmModal
                isOpen={policyOpen}
                onClose={() => setPolicyOpen(false)}
                onAccept={() => {
                  setPolicyOpen(false);
                  navigate(`/private-tour/book/${tour.id}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateTourDetail;
