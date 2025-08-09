import React, { useState, useEffect } from "react";
import { X, Calendar, Users, CreditCard, Clock, MapPin } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Tour, BookingForm } from "../types";
import { getTours } from "../services/googleSheets";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTour?: Tour;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedTour,
}) => {
  const { t } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingForm>({
    serviceId: selectedTour?.id || "",
    date: "",
    numberOfPeople: 1,
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadTours();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTour) {
      setFormData((prev) => ({ ...prev, serviceId: selectedTour.id }));
    }
  }, [selectedTour]);

  const loadTours = async () => {
    setLoading(true);
    try {
      const toursData = await getTours();
      setTours(toursData);
    } catch (error) {
      console.error("Error loading tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTourData = tours.find((tour) => tour.id === formData.serviceId);
  const totalPrice = selectedTourData
    ? selectedTourData.price * formData.numberOfPeople
    : 0;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    }
    // En el paso 3, el botón será para WhatsApp, no submit
  };

  // Generar mensaje de WhatsApp con formato
  const getWhatsappMessage = () => {
    return (
      `¡Hola! Me gustaría reservar un tour.\n\n` +
      `*Tour:* ${selectedTourData?.name || ""}\n` +
      `*Fecha:* ${formData.date}\n` +
      `*Personas:* ${formData.numberOfPeople}\n` +
      `*Precio por persona:* $${
        selectedTourData?.personPrice || selectedTourData?.price || ""
      }\n` +
      `*Total:* $${totalPrice}\n` +
      `*Nombre:* ${formData.fullName}\n` +
      `*Email:* ${formData.email}\n` +
      `*Teléfono:* ${formData.phone}\n` +
      (formData.specialRequests
        ? `*Solicitudes especiales:* ${formData.specialRequests}\n`
        : "")
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Mínimo mañana
    return today.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-teal-500" />
            {t.booking.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? "bg-teal-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Servicio</span>
            <span>Detalles</span>
            <span>Confirmar</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.booking.selectService}
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Seleccionar tour...</option>
                  {tours.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.name} - ${tour.price}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTourData && (
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-start space-x-4">
                    <img
                      src={selectedTourData.image}
                      alt={selectedTourData.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {selectedTourData.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedTourData.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedTourData.duration}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Roatán Este
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.booking.selectDate}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.booking.numberOfPeople}
                  </label>
                  <select
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} {i === 0 ? "persona" : "personas"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customer Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t.booking.customerInfo}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.booking.fullName}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.booking.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.booking.phone}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="+504 0000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.booking.specialRequests}
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Alguna solicitud especial o información adicional..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resumen
              </h3>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">
                  Resumen de la Reserva
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tour:</span>
                    <span className="font-medium">
                      {selectedTourData?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personas:</span>
                    <span>{formData.numberOfPeople}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio por persona:</span>
                    <span>${selectedTourData?.personPrice}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>{t.booking.total}:</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {t.common.back}
              </button>
            )}
            {step < 3 ? (
              <button
                type="submit"
                disabled={loading || (step === 1 && !formData.serviceId)}
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.common.next}
              </button>
            ) : (
              <a
                href={`https://wa.me/50432267504?text=${encodeURIComponent(
                  getWhatsappMessage()
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 text-center font-semibold text-lg flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 12c0 4.556-3.694 8.25-8.25 8.25A8.207 8.207 0 0 1 4.5 18.364L3 21l2.636-1.5A8.207 8.207 0 0 1 3.75 12c0-4.556 3.694-8.25 8.25-8.25s8.25 3.694 8.25 8.25Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 9.75a3.375 3.375 0 0 0 5.25 4.5l.375-.375"
                  />
                </svg>
                Confirmar por WhatsApp
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
