import React, { useState, useEffect } from 'react';
import { MessageCircle, Instagram, Facebook, ChevronUp } from 'lucide-react';
import { useSupabaseSet } from '../hooks/supabaseset';

const FloatingSocial: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const client = useSupabaseSet();
  const [admin, setAdmin] = useState<any | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client.from('admin').select('*').maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error('Error loading admin in FloatingSocial', err);
      }
    })();
    return () => { mounted = false; };
  }, [client]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const socialButtons: Array<any> = [];

  if (admin?.celular) {
    socialButtons.push({
      name: 'WhatsApp',
      href: `https://wa.me/${admin.celular.replace(/[^0-9+]/g, '')}`,
      icon: <MessageCircle className="w-6 h-6" />,
      bgColor: 'bg-green-500 hover:bg-green-600',
      pulse: true,
    });
  }

  if (admin?.instagram) {
    socialButtons.push({
      name: 'Instagram',
      href: admin.instagram.startsWith('http') ? admin.instagram : `https://${admin.instagram}`,
      icon: <Instagram className="w-6 h-6" />,
      bgColor: 'bg-pink-500 hover:bg-pink-600',
      pulse: false,
    });
  }

  if (admin?.facebook) {
    socialButtons.push({
      name: 'Facebook',
      href: admin.facebook.startsWith('http') ? admin.facebook : `https://${admin.facebook}`,
      icon: <Facebook className="w-6 h-6" />,
      bgColor: 'bg-blue-500 hover:bg-blue-600',
      pulse: false,
    });
  }

  return (
    <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-40 flex flex-col items-end space-y-3">
      {/* Social Buttons */}
      {socialButtons.map((button, index) => (
        <a
          key={button.name}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            group ${button.bgColor} text-white p-3 rounded-full shadow-lg 
            transform transition-all duration-300 hover:scale-110 hover:shadow-xl
            ${button.pulse ? 'animate-pulse' : ''}
          `}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
          title={button.name}
        >
          {button.icon}
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {button.name}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </a>
      ))}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl animate-fadeInUp"
          title="Volver al inicio"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default FloatingSocial;
