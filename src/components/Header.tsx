import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useSupabaseSet } from "../hooks/supabaseset";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [privateTourDropdownOpen, setPrivateTourDropdownOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const client = useSupabaseSet();
  const [admin, setAdmin] = useState<any | null>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [privateTours, setPrivateTours] = useState<any[]>([]);
  const base = import.meta.env.BASE_URL ?? "/";
  const candidateLogos = [
    `${base}logo.webp`,
    `${base}images/logo.webp`,
    `/logo.webp`,
    `/images/logo.webp`,
  ];
  const [logoSrc, setLogoSrc] = useState<string>(candidateLogos[0]);
  const servicesCloseTimer = useRef<number | null>(null);
  const privateCloseTimer = useRef<number | null>(null);

  const scheduleCloseServices = (ms = 300) => {
    if (servicesCloseTimer.current) window.clearTimeout(servicesCloseTimer.current);
    servicesCloseTimer.current = window.setTimeout(() => setServicesDropdownOpen(false), ms);
  };

  const cancelCloseServices = () => {
    if (servicesCloseTimer.current) {
      window.clearTimeout(servicesCloseTimer.current);
      servicesCloseTimer.current = null;
    }
  };

  const scheduleClosePrivate = (ms = 300) => {
    if (privateCloseTimer.current) window.clearTimeout(privateCloseTimer.current);
    privateCloseTimer.current = window.setTimeout(() => setPrivateTourDropdownOpen(false), ms);
  };

  const cancelClosePrivate = () => {
    if (privateCloseTimer.current) {
      window.clearTimeout(privateCloseTimer.current);
      privateCloseTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (servicesCloseTimer.current) window.clearTimeout(servicesCloseTimer.current);
      if (privateCloseTimer.current) window.clearTimeout(privateCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client
          .from("admin")
          .select("*")
          .maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error("Error loading admin for header:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);

  // Load tours for dropdown menus
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Load regular tours (paquetes)
        const { data: toursData, error: toursError } = await client
          .from("paquetes")
          .select("id, titulo")
          .order("id", { ascending: true })
          .limit(10);
        if (toursError) throw toursError;
        if (mounted) setTours(toursData || []);

        // Load private tours
        const { data: privateData, error: privateError } = await client
          .from("private_tours")
          .select("id, title")
          .order("id", { ascending: true })
          .limit(10);
        if (privateError) throw privateError;
        if (mounted) setPrivateTours(privateData || []);
      } catch (err) {
        console.error("Error loading tours for header dropdown:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);

  // When admin.logo is available it might be a remote signed URL that takes
  // time to resolve. Preload it and fall back to a local asset that works
  // regardless of deployment base path.
  useEffect(() => {
    let cancelled = false;

    const setIfNotCancelled = (src: string) => {
      if (!cancelled) setLogoSrc(src);
    };

    // Try admin.logo first (if present), then try candidate public paths in order.
    const tryLoad = (srcs: string[]) => {
      if (srcs.length === 0) return;
      const src = srcs[0];
      const img = new Image();
      img.src = src;
      img.onload = () => setIfNotCancelled(src);
      img.onerror = () => tryLoad(srcs.slice(1));
    };

    if (admin?.logo) {
      const imgAdmin = new Image();
      imgAdmin.src = admin.logo;
      imgAdmin.onload = () => setIfNotCancelled(admin.logo);
      imgAdmin.onerror = () => tryLoad(candidateLogos);
    } else {
      tryLoad(candidateLogos);
    }

    return () => {
      cancelled = true;
    };
  }, [admin?.logo]);

  // Header is always visible and opaque; no scroll detection needed

  const navItems = [
    { key: "home", href: "/", label: t.nav.home },
    { key: "services", href: "/services", label: t.nav.services, hasDropdown: true },
    { key: "private-tour", href: "/private-tour", label: "Private Tour", hasDropdown: true },
    { key: "gallery", href: "/gallery", label: t.nav.gallery },
    { key: "contact", href: "/contact", label: t.nav.contact },
  ];

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const isActivePath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg`}
    >
      <div className="container mx-auto px-6 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src={logoSrc}
              alt={`${admin?.nombre_web ?? "Roatan Robert Tours"} Logo`}
              className="w-19 h-11 rounded-full shadow-lg border-9 border-white bg-white object-cover group-hover:scale-110 transition-transform duration-200"
              style={{ background: "white" }}
            />
            <div className="hidden sm:block">
              <h1 className={`font-bold text-lg text-gray-800`}>
                {admin?.nombre_web ?? "Roatan Robert Tours"}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.key === "services" && item.hasDropdown) {
                return (
                  <div
                    key={item.key}
                    className="relative group"
                    onMouseEnter={() => {
                      cancelCloseServices();
                      setServicesDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      scheduleCloseServices(350);
                    }}
                  >
                    <Link
                      to={item.href}
                      className={`font-medium transition-colors duration-200 hover:text-teal-500 flex items-center gap-1 ${
                        isActivePath(item.href) ? "text-teal-500" : "text-gray-800"
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                    </Link>
                    
                    {servicesDropdownOpen && tours.length > 0 && (
                      <div
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-[100]"
                        onMouseEnter={() => cancelCloseServices()}
                        onMouseLeave={() => scheduleCloseServices(350)}
                      >
                        <div className="py-2 max-h-96 overflow-y-auto">
                          {tours.map((tour) => (
                            <Link
                              key={tour.id}
                              to={`/service/${tour.id}`}
                              className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200 text-sm font-medium border-b border-gray-50 last:border-0"
                              onClick={() => setServicesDropdownOpen(false)}
                            >
                              {tour.titulo || tour.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              if (item.key === "private-tour" && item.hasDropdown) {
                return (
                  <div
                    key={item.key}
                    className="relative group"
                    onMouseEnter={() => {
                      cancelClosePrivate();
                      setPrivateTourDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      scheduleClosePrivate(350);
                    }}
                  >
                    <Link
                      to={item.href}
                      className={`font-medium transition-colors duration-200 hover:text-teal-500 flex items-center gap-1 ${
                        isActivePath(item.href) ? "text-teal-500" : "text-gray-800"
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${privateTourDropdownOpen ? 'rotate-180' : ''}`} />
                    </Link>
                    
                    {privateTourDropdownOpen && privateTours.length > 0 && (
                      <div
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-[100]"
                        onMouseEnter={() => cancelClosePrivate()}
                        onMouseLeave={() => scheduleClosePrivate(350)}
                      >
                        <div className="py-2 max-h-96 overflow-y-auto">
                          {privateTours.map((tour) => (
                            <Link
                              key={tour.id}
                              to={`/private-tour/${tour.id}`}
                              className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200 text-sm font-medium border-b border-gray-50 last:border-0"
                              onClick={() => setPrivateTourDropdownOpen(false)}
                            >
                              {tour.titulo || tour.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`font-medium transition-colors duration-200 hover:text-teal-500 ${
                    isActivePath(item.href) ? "text-teal-500" : "text-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors duration-200 text-gray-800 hover:bg-gray-100`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg mb-4 overflow-hidden">
            <nav className="py-4">
              {navItems.map((item) => {
                if (item.key === "services" && item.hasDropdown) {
                  return (
                    <div key={item.key}>
                      <Link
                        to={item.href}
                        onClick={() => {
                          setServicesDropdownOpen(!servicesDropdownOpen);
                        }}
                        className={`flex items-center justify-between px-6 py-3 font-medium transition-colors duration-200 hover:bg-teal-50 hover:text-teal-600 ${
                          isActivePath(item.href)
                            ? "text-teal-600 bg-teal-50"
                            : "text-gray-800"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                      </Link>
                      {servicesDropdownOpen && tours.length > 0 && (
                        <div className="bg-gray-50 border-l-4 border-teal-500 max-h-60 overflow-y-auto">
                          {tours.map((tour) => (
                            <Link
                              key={tour.id}
                              to={`/service/${tour.id}`}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setServicesDropdownOpen(false);
                              }}
                              className="block px-10 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                            >
                              {tour.titulo}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                if (item.key === "private-tour" && item.hasDropdown) {
                  return (
                    <div key={item.key}>
                      <Link
                        to={item.href}
                        onClick={() => {
                          setPrivateTourDropdownOpen(!privateTourDropdownOpen);
                        }}
                        className={`flex items-center justify-between px-6 py-3 font-medium transition-colors duration-200 hover:bg-teal-50 hover:text-teal-600 ${
                          isActivePath(item.href)
                            ? "text-teal-600 bg-teal-50"
                            : "text-gray-800"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${privateTourDropdownOpen ? 'rotate-180' : ''}`} />
                      </Link>
                      {privateTourDropdownOpen && privateTours.length > 0 && (
                        <div className="bg-gray-50 border-l-4 border-teal-500 max-h-60 overflow-y-auto">
                          {privateTours.map((tour) => (
                            <Link
                              key={tour.id}
                              to={`/private-tour/${tour.id}`}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setPrivateTourDropdownOpen(false);
                              }}
                              className="block px-10 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                            >
                              {tour.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-6 py-3 font-medium transition-colors duration-200 hover:bg-teal-50 hover:text-teal-600 ${
                      isActivePath(item.href)
                        ? "text-teal-600 bg-teal-50"
                        : "text-gray-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
