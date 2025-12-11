import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupabaseSet } from "../hooks/supabaseset";
import PrivateTourBookingForm from "../components/PrivateTourBookingForm";

const PrivateTourBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useSupabaseSet();
  const [tour, setTour] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadTour(id);
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
    } catch (err) {
      console.error("Error loading tour:", err);
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent relative z-10">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Tour not found</h2>
          <p className="text-gray-600 mb-4">
            The requested private tour could not be found.
          </p>
          <button
            onClick={() => navigate("/private-tour")}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PrivateTourBookingForm
          tourId={tour.id}
          tourTitle={tour.title}
          showAdditionalOptions={!!tour.show_additional_options}
          onClose={() => navigate("/private-tour")}
          isPage={true}
        />
      </div>
    </div>
  );
};

export default PrivateTourBookingPage;
