import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  Phone,
  Mail,
  Ship,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseSet } from "../hooks/supabaseset";
import {
  GOOGLE_SCRIPT_CONFIG,
  validateGoogleScriptConfig,
} from "../config/googleScript";

interface TourAdditionalOption {
  id: number;
  title: string;
  subtitle: string;
  features: string;
}

interface BookingFormProps {
  tourId: number;
  tourTitle: string;
  showAdditionalOptions: boolean;
  onClose?: () => void;
  isPage?: boolean;
}

const PrivateTourBookingForm: React.FC<BookingFormProps> = ({
  tourId,
  tourTitle,
  showAdditionalOptions,
  onClose,
  isPage = false,
}) => {
  const client = useSupabaseSet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [additionalOptions, setAdditionalOptions] = useState<
    TourAdditionalOption[]
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  // Fecha de hoy en formato local YYYY-MM-DD para usar en el input date (min)
  const getTodayString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };
  const todayStr = getTodayString();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    hometownCity: "",
    hometownState: "",
    hometownCountry: "United States",
    numberOfGuestsAge5Up: 1,
    numberOfGuestsUnder5: 0,
    phone: "",
    email: "",
    cruiseShipOrResortName: "",
    requestedTourDate: "",
    comments: "",
  });

  useEffect(() => {
    if (showAdditionalOptions) {
      loadAdditionalOptions();
    }
  }, [showAdditionalOptions]);

  const loadAdditionalOptions = async () => {
    try {
      const { data, error } = await client
        .from("tour_additional_options")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setAdditionalOptions(data || []);
    } catch (error) {
      console.error("Error loading additional options:", error);
    }
  };

  const handleOptionToggle = (optionId: number) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.email ||
      !formData.cruiseShipOrResortName
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        tour_id: tourId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        hometown_city: formData.hometownCity,
        hometown_state: formData.hometownState,
        hometown_country: formData.hometownCountry,
        number_of_guests_age_5_up: formData.numberOfGuestsAge5Up,
        number_of_guests_under_5: formData.numberOfGuestsUnder5,
        phone: formData.phone,
        email: formData.email,
        cruise_ship_or_resort_name: formData.cruiseShipOrResortName,
        requested_tour_date: formData.requestedTourDate || null,
        selected_additional_options: selectedOptions,
        comments: formData.comments,
        status: "pending",
      };

      const { error } = await client
        .from("private_tour_bookings")
        .insert([bookingData]);

      if (error) throw error;

      // Send booking data to Google Apps Script for email notification
      try {
        // Get additional options details for the email
        const selectedOptionsDetails = additionalOptions
          .filter((opt) => selectedOptions.includes(opt.id))
          .map((opt) => ({
            title: opt.title,
            subtitle: opt.subtitle,
            features: opt.features,
          }));

        const googleScriptData = {
          tourTitle: tourTitle,
          firstName: formData.firstName,
          lastName: formData.lastName,
          hometownCity: formData.hometownCity,
          hometownState: formData.hometownState,
          hometownCountry: formData.hometownCountry,
          numberOfGuestsAge5Up: formData.numberOfGuestsAge5Up,
          numberOfGuestsUnder5: formData.numberOfGuestsUnder5,
          phone: formData.phone,
          email: formData.email,
          cruiseShipOrResortName: formData.cruiseShipOrResortName,
          requestedTourDate: formData.requestedTourDate || "",
          selectedAdditionalOptions: selectedOptionsDetails,
          comments: formData.comments,
          submittedAt: new Date().toISOString(),
        };

        // Send to Google Apps Script if configured
        if (validateGoogleScriptConfig()) {
          if (GOOGLE_SCRIPT_CONFIG.DEBUG) {
            console.log(
              "Sending booking data to Google Script:",
              googleScriptData
            );
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            GOOGLE_SCRIPT_CONFIG.TIMEOUT
          );

          try {
            await fetch(GOOGLE_SCRIPT_CONFIG.GOOGLE_SCRIPT_URL, {
              method: "POST",
              mode: "no-cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(googleScriptData),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (GOOGLE_SCRIPT_CONFIG.DEBUG) {
              console.log("✅ Booking data sent to Google Script successfully");
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
          }
        } else {
          console.warn(
            "⚠️ Google Script not configured - emails will not be sent. Check src/config/googleScript.ts"
          );
        }
      } catch (scriptError) {
        console.error("❌ Error sending to Google Script:", scriptError);
        // Continue even if Google Script fails - booking is already saved in DB
      }

      // Navigate to confirmation page with booking details
      navigate("/private-tour/booking-confirmation", {
        state: {
          email: formData.email,
          tourDate: formData.requestedTourDate || "your selected date",
          cruiseName: formData.cruiseShipOrResortName,
        },
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Error submitting booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        isPage
          ? "py-12"
          : "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
      }
    >
      <div
        className={
          isPage
            ? "bg-white rounded-2xl shadow-none w-full max-w-4xl mx-auto"
            : "bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8"
        }
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Book Your Adventure</h2>
              <p className="text-teal-100">{tourTitle}</p>
            </div>
            {!isPage && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-teal-600" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Hometown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Hometown *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.hometownCity}
                  onChange={(e) =>
                    setFormData({ ...formData, hometownCity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State / Province / Region
                </label>
                <input
                  type="text"
                  value={formData.hometownState}
                  onChange={(e) =>
                    setFormData({ ...formData, hometownState: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.hometownCountry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hometownCountry: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Number of Guests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests [Age 5 and Up] *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.numberOfGuestsAge5Up}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfGuestsAge5Up: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests [Under Age 5]
              </label>
              <input
                type="number"
                min="0"
                value={formData.numberOfGuestsUnder5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfGuestsUnder5: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Leave Blank if 0"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-teal-600" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Cruise/Resort Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Ship className="w-5 h-5 mr-2 text-teal-600" />
              Travel Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cruise Ship Name or Resort Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cruiseShipOrResortName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cruiseShipOrResortName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="This is the NAME of your ship (NOT the brand). For Example, Carnival MARDI GRAS, not 'Carnival'"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the NAME of your ship (NOT the brand). For Example,
                  Carnival MARDI GRAS, not "Carnival"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Requested Tour Date
                </label>
                <input
                  type="date"
                  value={formData.requestedTourDate}
                  min={todayStr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedTourDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          {showAdditionalOptions && additionalOptions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Additional Options (Optional)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {additionalOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`option-${option.id}`}
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionToggle(option.id)}
                      className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <label
                      htmlFor={`option-${option.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-semibold text-gray-800">
                        {option.title}
                      </div>
                      {option.subtitle && (
                        <div className="text-sm text-teal-600 mt-1">
                          {option.subtitle}
                        </div>
                      )}
                      {option.features && (
                        <div className="text-sm text-gray-600 mt-1">
                          {option.features}
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              Comments or Questions
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Any special requests or questions?"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrivateTourBookingForm;
