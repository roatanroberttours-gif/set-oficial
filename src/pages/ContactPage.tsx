import React from 'react';
import Contact from '../components/Contact';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contáctanos
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Estamos aquí para hacer realidad tu aventura en Roatán
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-200">Disponibilidad WhatsApp</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">&lt; 1h</div>
                <div className="text-blue-200">Tiempo de Respuesta</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">3+</div>
                <div className="text-blue-200">Años de Experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Component */}
      <Contact />

      {/* Additional Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* FAQ Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Preguntas Frecuentes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    ¿Cuál es la mejor época para visitar?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Roatán es perfecto todo el año. La temporada seca va de febrero a agosto, 
                    pero nuestros tours operan durante todo el año con las mejores condiciones de seguridad.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    ¿Qué debo traer para los tours?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Recomendamos protector solar, repelente, ropa cómoda, calzado antideslizante, 
                    y cambio de ropa para actividades acuáticas. Nosotros proporcionamos todo el equipo necesario.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    ¿Los tours son aptos para niños?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sí, la mayoría de nuestros tours son familiares. Algunos tienen restricciones de edad 
                    por seguridad. Consulta los detalles de cada tour o contáctanos para recomendaciones específicas.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    ¿Incluyen transporte desde el hotel?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sí, todos nuestros tours incluyen transporte gratuito desde hoteles en Roatán Este. 
                    Para otras áreas, coordinaremos el punto de encuentro más conveniente.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    ¿Qué métodos de pago aceptan?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Aceptamos efectivo (dólares americanos y lempiras), PayPal, y transferencias bancarias. 
                    Para reservas online preferimos PayPal por su seguridad.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    ¿Cuál es su política de cancelación?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Cancelación gratuita hasta 24 horas antes del tour. Para cancelaciones por mal clima, 
                    ofrecemos reagendamiento o reembolso completo.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-16 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-red-800 mb-4">
                Contacto de Emergencia
              </h3>
              <p className="text-red-700 mb-4">
                Si tienes una emergencia durante tu tour o necesitas asistencia inmediata:
              </p>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-red-800">
                  📞 +504 3226-7504
                </div>
                <div className="text-lg font-semibold text-red-800">
                  📱 WhatsApp 24/7
                </div>
              </div>
              <p className="text-sm text-red-600 mt-4">
                Nuestro equipo está siempre disponible para garantizar tu seguridad y bienestar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
