import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Instagram,
  Facebook,
  Clock,
} from "lucide-react";
import { useSupabaseSet } from "../hooks/supabaseset";
import { useLanguage } from "../contexts/LanguageContext";

const Contact: React.FC = () => {
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
        console.error(
          "Error loading admin contact data in Contact component",
          err
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);
  // no contact form: centralizamos canales de contacto en `admin` y CTA directas

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: t.contact.phone,
      value: admin?.celular ?? "+504 3226-7504",
      href: admin?.celular
        ? `tel:${admin.celular.replace(/\s+/g, "")}`
        : "tel:+50432267504",
      description: "Call us directly",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: t.contact.whatsapp,
      value: admin?.celular ?? "+504 3226-7504",
      href: admin?.celular
        ? `https://wa.me/${admin.celular.replace(/[^0-9+]/g, "")}`
        : "https://wa.me/50432267504?text=Hola!%20Me%20interesa%20información%20sobre%20sus%20tours",
      description: "Immediate response",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t.contact.email,
      value: admin?.correo ?? "rteastendexp@gmail.com",
      href: admin?.correo
        ? `mailto:${admin.correo}`
        : "mailto:rteastendexp@gmail.com",
      description: "Send us an email",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      value: admin?.direccion ?? "Roatán East, Honduras",
      href: "https://maps.google.com/?q=Roatan+East+End+Honduras",
      description: "Bay Islands, Honduras",
    },
  ];

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

  const businessHours = [
    { day: "Mon - Fri", hours: "8:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "8:00 AM - 5:00 PM" },
    { day: "Sunday", hours: "9:00 AM - 4:00 PM" },
  ];

  const openWhatsApp = () => {
    const num = admin?.celular
      ? admin.celular.replace(/[^0-9+]/g, "")
      : "50432267504";
    const url = `https://wa.me/${num}?text=${encodeURIComponent(
      "Hello! I am interested in information about your tours"
    )}`;
    window.open(url, "_blank");
  };

  const openMail = () => {
    const mail = admin?.correo || "rteastendexp@gmail.com";
    window.location.href = `mailto:${mail}`;
  };

  return (
    <section id="contact" className="py-20 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            {t.contact.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    info.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group bg-transparent backdrop-blur-sm p-6 rounded-2xl shadow-none transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1">{info.value}</p>
                      <p className="text-gray-500 text-xs">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Business Hours */}
            <div className="bg-transparent backdrop-blur-sm p-6 rounded-2xl shadow-none">
              <h3 className="flex items-center font-semibold text-gray-800 mb-4">
                <Clock className="w-5 h-5 mr-2 text-teal-500" />
                Business Hours
              </h3>
              <div className="space-y-2">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{schedule.day}</span>
                    <span className="font-medium text-gray-800">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-transparent backdrop-blur-sm p-6 rounded-2xl shadow-none">
              <h3 className="font-semibold text-gray-800 mb-4">
                {t.contact.social}
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl text-gray-600 transition-all duration-200 ${social.color} hover:scale-110 hover:shadow-md`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact CTA (sin formulario) */}
          <div className="flex items-center justify-center">
            <div className="bg-transparent backdrop-blur-sm p-8 rounded-2xl shadow-none w-full">
              <div className="flex flex-col items-center text-center gap-4">
                {admin?.logo && (
                  <img
                    src={admin.logo}
                    alt={admin.nombre_web || "Logo"}
                    className="w-88 h-88 object-contain rounded-md"
                  />
                )}
                <h3 className="text-2xl font-bold text-gray-800">Contact Us</h3>
                <p className="text-gray-600">
                  We are ready to help. Send us a WhatsApp message, call, or
                  email.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={openWhatsApp}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={openMail}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Email
                  </button>
                  <a
                    href={
                      admin?.celular
                        ? `tel:${admin.celular.replace(/\s+/g, "")}`
                        : "tel:+50432267504"
                    }
                    className="px-6 py-3 bg-gray-100 rounded-lg text-gray-800 flex items-center justify-center"
                  >
                    Call
                  </a>
                </div>

                <a
                  href={
                    admin?.direccion
                      ? `https://maps.google.com/?q=${encodeURIComponent(
                          admin.direccion
                        )}`
                      : "https://maps.google.com/?q=Roatan+East+End+Honduras"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-teal-600 underline mt-3"
                >
                  View location on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
