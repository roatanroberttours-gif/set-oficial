import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useSupabaseSet } from "../hooks/supabaseset";
import { useEffect, useState } from "react";

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const client = useSupabaseSet();
  const [admin, setAdmin] = useState<any | null>(null);

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
        console.error("Error loading admin contact data:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);

  const socialLinks = [
    {
      name: "WhatsApp",
      href: admin?.celular
        ? `https://wa.me/${admin.celular.replace(/[^0-9+]/g, "")}`
        : "https://wa.me/50432267504",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.951 3.506z" />
        </svg>
      ),
      color: "hover:text-green-500",
    },
    {
      name: "Instagram",
      href: admin?.instagram
        ? admin.instagram.startsWith("http")
          ? admin.instagram
          : `https://${admin.instagram}`
        : "https://instagram.com/roataneasthiddengem",
      icon: <Instagram className="w-6 h-6" />,
      color: "hover:text-pink-500",
    },
    {
      name: "Facebook",
      href: admin?.facebook
        ? admin.facebook.startsWith("http")
          ? admin.facebook
          : `https://${admin.facebook}`
        : "https://facebook.com/roataneasthiddengem",
      icon: <Facebook className="w-6 h-6" />,
      color: "hover:text-blue-500",
    },
  ];

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: t.contact.phone,
      value: admin?.celular ?? "+504 3226-7504",
      href: admin?.celular
        ? `tel:${admin.celular.replace(/\s+/g, "")}`
        : "tel:+50432267504",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: t.contact.email,
      value: admin?.correo ?? "rteastendexp@gmail.com",
      href: admin?.correo
        ? `mailto:${admin.correo}`
        : "mailto:rteastendexp@gmail.com",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Roatán, Honduras",
      value: admin?.direccion ?? "East End, Bay Islands",
      href: "https://maps.google.com/?q=Roatan+East+End+Honduras",
    },
  ];

  const quickLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.services, href: "/services" },
    { label: t.nav.gallery, href: "/gallery" },
    { label: t.nav.contact, href: "/contact" },
  ];

  return (
    <footer className="relative z-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {admin?.nombre_web ?? "Roatan Robert Tours"}
                </h3>
                <p className="text-gray-300 text-sm">{t.hero.subtitle}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t.hero.description}
            </p>

            {/* Social Media */}
            <div className="flex space-x-4">
              <span className="text-gray-300 font-medium">
                {t.contact.social}:
              </span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-colors duration-200 ${social.color}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-teal-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t.contact.title}</h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="text-teal-400 mt-1 flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{info.label}</p>
                    <a
                      href={info.href}
                      target={
                        info.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        info.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-gray-300 hover:text-teal-400 transition-colors duration-200"
                    >
                      {info.value}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()}{" "}
              {admin?.nombre_web ?? "Roatan Robert Tours"}. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Made with ❤️ for the conservation of Roatán
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
