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
  image?: string;
  price?: number;
  duration?: string;
  description?: string;
  subtitle?: string;
  features?: string;
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

  const [meetingPoints, setMeetingPoints] = useState<any[]>([]);
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<any | null>(
    null
  );

  const [tourData, setTourData] = useState<any | null>(null);
  const [perPersonPrice, setPerPersonPrice] = useState<number | null>(null);

  useEffect(() => {
    if (showAdditionalOptions) {
      loadAdditionalOptions();
    }
  }, [showAdditionalOptions]);

  useEffect(() => {
    // Load meeting points for Cruise Ship / Resort selection
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client
          .from("meeting_points")
          .select("*")
          .eq("is_active", true)
          .order("id", { ascending: true });
        if (error) throw error;
        if (mounted) setMeetingPoints(data || []);
      } catch (err) {
        console.error("Error loading meeting points:", err);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load tour data / price (try private_tours first, then paquetes)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!tourId) return;

        // Try private_tours
        const { data: privateData, error: privateError } = await client
          .from("private_tours")
          .select("*")
          .eq("id", Number(tourId))
          .single();

        if (!privateError && privateData) {
          if (!mounted) return;
          setTourData(privateData);
          // Determine per-person price from tiered fields
          const num = Number(formData.numberOfGuestsAge5Up) || 1;
          let per: number | null = null;
          if (num >= 1 && num <= 4) {
            const field = num === 1 ? "price_1_person" : `price_${num}_persons`;
            if (privateData[field] != null) {
              const raw = Number(privateData[field]);
              per = raw / (num || 1);
            }
          }
          // fallback: try price_1_person or price_4_persons
          if (per == null) {
            if (privateData.price_1_person)
              per = Number(privateData.price_1_person);
            else if (privateData.price_4_persons)
              per = Number(privateData.price_4_persons) / 4;
          }
          setPerPersonPrice(per ?? null);
          return;
        }

        // Otherwise try paquetes (use precio_por_persona or price)
        const { data: paqData, error: paqError } = await client
          .from("paquetes")
          .select("*")
          .eq("id", Number(tourId))
          .single();

        if (!paqError && paqData) {
          if (!mounted) return;
          setTourData(paqData);
          const per = paqData.precio_por_persona ?? paqData.price ?? null;
          setPerPersonPrice(per != null ? Number(per) : null);
          return;
        }
      } catch (err) {
        console.error("Error loading tour price:", err);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  // Compute current per-person price based on loaded tourData and guest count
  const computedPerPersonPrice = React.useMemo(() => {
    if (!tourData) return perPersonPrice;
    const num = Number(formData.numberOfGuestsAge5Up) || 1;
    // private_tours structure: treat the stored fields as the per-person rate for that guest bracket
    if (
      tourData.price_1_person != null ||
      tourData.price_2_persons != null ||
      tourData.price_3_persons != null ||
      tourData.price_4_persons != null
    ) {
      if (num === 1 && tourData.price_1_person != null) {
        return Number(tourData.price_1_person);
      }
      if (num === 2 && tourData.price_2_persons != null) {
        return Number(tourData.price_2_persons);
      }
      if (num === 3 && tourData.price_3_persons != null) {
        return Number(tourData.price_3_persons);
      }
      if (num >= 4 && tourData.price_4_persons != null) {
        return Number(tourData.price_4_persons);
      }

      // Fallbacks: if only price_1_person is set, use it; else if price_4_persons looks like a per-person value use it
      if (tourData.price_1_person != null)
        return Number(tourData.price_1_person);
      if (tourData.price_4_persons != null)
        return Number(tourData.price_4_persons);
    }

    // paquetes style
    if (tourData.precio_por_persona != null)
      return Number(tourData.precio_por_persona);
    if (tourData.price != null) return Number(tourData.price);

    return perPersonPrice;
  }, [tourData, formData.numberOfGuestsAge5Up, perPersonPrice]);

  // Compute extras subtotal (sum of selected additional options' price * guests)
  const extrasSubtotal = React.useMemo(() => {
    if (!additionalOptions || additionalOptions.length === 0) return 0;
    const guests = Number(formData.numberOfGuestsAge5Up) || 1;
    const selected = additionalOptions.filter((opt) =>
      selectedOptions.includes(opt.id)
    );
    const sumPerPerson = selected.reduce(
      (acc, cur) => acc + (Number(cur.price) || 0),
      0
    );
    return sumPerPerson * guests;
  }, [additionalOptions, selectedOptions, formData.numberOfGuestsAge5Up]);

  const loadAdditionalOptions = async () => {
    try {
      // Load tours from `paquetes` table and use them as additional options
      const { data, error } = await client
        .from("paquetes")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((paq: any) => {
        const images = Array.from({ length: 10 }).map(
          (_, i) => paq[`imagen${i + 1}`]
        );
        const image = images.find((img: any) => img) || "";
        return {
          id: paq.id,
          title: paq.titulo || paq.title || `Tour ${paq.id}`,
          image,
          price: paq.precio_por_persona ?? paq.price ?? 0,
          duration: paq.duracion || "",
          description: paq.descripcion || paq.description || "",
        } as TourAdditionalOption;
      });

      setAdditionalOptions(mapped);
    } catch (error) {
      console.error("Error loading additional options (paquetes):", error);
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

    // Validación: todos los campos obligatorios (excepto Additional Options)
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.hometownCity ||
      !formData.hometownState ||
      !formData.hometownCountry ||
      !formData.numberOfGuestsAge5Up ||
      Number(formData.numberOfGuestsAge5Up) < 1 ||
      formData.numberOfGuestsUnder5 < 0 ||
      !formData.phone ||
      !formData.email ||
      !formData.cruiseShipOrResortName ||
      !formData.requestedTourDate ||
      !formData.comments
    ) {
      alert(
        "Por favor complete todos los campos obligatorios antes de enviar."
      );
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
            id: opt.id,
            title: opt.title,
            image: opt.image,
            price: opt.price,
            duration: opt.duration,
            description: opt.description,
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
          // Meeting Point details
          meetingPoint: selectedMeetingPoint
            ? {
                title: selectedMeetingPoint.title,
                zone: selectedMeetingPoint.zone,
                instructions: selectedMeetingPoint.instructions,
                mapUrl: selectedMeetingPoint.map_url,
              }
            : null,
          // Pricing details
          pricePerPerson: computedPerPersonPrice ?? 0,
          numberOfGuests: formData.numberOfGuestsAge5Up,
          extrasTotal: extrasSubtotal,
          estimatedTotal:
            (computedPerPersonPrice ?? 0) *
              Number(formData.numberOfGuestsAge5Up) +
            extrasSubtotal,
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
      {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white/90 px-6 py-4 rounded-md text-lg font-semibold">
            enviando datos...
          </div>
        </div>
      )}
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
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hometownCity}
                  onChange={(e) =>
                    setFormData({ ...formData, hometownCity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State / Province / Region *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hometownState}
                  onChange={(e) =>
                    setFormData({ ...formData, hometownState: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
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
                Number of Guests [Under Age 5] *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.numberOfGuestsUnder5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfGuestsUnder5: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                <select
                  required
                  value={formData.cruiseShipOrResortName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, cruiseShipOrResortName: val });
                    const found = meetingPoints.find(
                      (m) => String(m.title) === val || String(m.id) === val
                    );
                    // Prefer matching by title; if option value is id then match by id
                    if (found) setSelectedMeetingPoint(found);
                    else setSelectedMeetingPoint(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a meeting point</option>
                  {meetingPoints.map((mp) => (
                    <option key={mp.id} value={mp.title}>
                      {mp.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the meeting point where you will be picked up.
                </p>

                {selectedMeetingPoint && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800">
                      Meeting Point
                    </h4>
                    {selectedMeetingPoint.zone && (
                      <div className="text-sm text-green-700 mt-1">
                        <strong>Zone:</strong> {selectedMeetingPoint.zone}
                      </div>
                    )}
                    {selectedMeetingPoint.instructions && (
                      <div className="text-sm text-gray-700 mt-2">
                        {selectedMeetingPoint.instructions}
                      </div>
                    )}
                    {selectedMeetingPoint.map_url && (
                      <div className="mt-3">
                        <a
                          href={selectedMeetingPoint.map_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        >
                          Map
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Requested Tour Date *
                </label>
                <input
                  type="date"
                  required
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
                {additionalOptions.map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-gradient-to-r from-green-50 to-green-100 ring-1 ring-green-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`option-${option.id}`}
                        checked={isSelected}
                        onChange={() => handleOptionToggle(option.id)}
                        className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />

                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        {option.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={option.image}
                            alt={option.title}
                            className="w-16 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-200 rounded-md" />
                        )}
                      </div>

                      <label
                        htmlFor={`option-${option.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-semibold text-gray-800 text-sm">
                          {option.title}
                        </div>
                        {option.description && (
                          <div className="text-sm mt-1 truncate text-red-500">
                            {option.description.length > 120
                              ? option.description.slice(0, 117) + "..."
                              : option.description}
                          </div>
                        )}
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <span className="mr-3">${option.price ?? 0}</span>
                          {option.duration && <span>{option.duration}</span>}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              Comments or Questions *
            </label>
            <textarea
              required
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Any special requests or questions?"
            />
          </div>

          {/* Total Price (per person * number of guests [5+]) */}
          <div className="mt-2">
            <div className="flex items-center justify-end space-x-6 pt-4">
              {/* Base tour total (if available) */}
              <div className="text-right">
                <div className="text-sm text-gray-600">Precio por persona</div>
                <div className="text-lg font-bold text-gray-800">
                  {computedPerPersonPrice != null
                    ? `$${computedPerPersonPrice.toFixed(2)}`
                    : "—"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600">Invitados (5+)</div>
                <div className="text-lg font-bold text-gray-800">
                  {Number(formData.numberOfGuestsAge5Up)}
                </div>
              </div>

              {/* Extras subtotal */}
              <div className="text-right">
                <div className="text-sm text-gray-600">Adicionales (total)</div>
                <div className="text-lg font-bold text-gray-800">
                  ${extrasSubtotal.toFixed(2)}
                </div>
              </div>

              {/* Grand total */}
              <div className="text-right">
                <div className="text-sm text-gray-600">Total estimado</div>
                <div className="text-xl font-extrabold text-teal-600">
                  $
                  {(
                    (computedPerPersonPrice ?? 0) *
                      Number(formData.numberOfGuestsAge5Up) +
                    extrasSubtotal
                  ).toFixed(2)}
                </div>
              </div>
            </div>
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
