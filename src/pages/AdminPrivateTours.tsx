import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { useSupabaseSet } from "../hooks/supabaseset";
import { formatTextToHtml } from "../lib/formatText";

interface PrivateTour {
  id?: number;
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

const AdminPrivateTours: React.FC = () => {
  const client = useSupabaseSet();
  const [tours, setTours] = useState<PrivateTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTour, setEditingTour] = useState<PrivateTour | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const emptyTour: PrivateTour = {
    title: "",
    description: "",
    image1: "",
    image2: "",
    image3: "",
    price_1_person: 0,
    price_2_persons: 0,
    price_3_persons: 0,
    price_4_persons: 0,
    price_children_under_5: 0,
    whats_included: "",
    duration: "",
    tour_notes: "",
    show_additional_options: false,
    available_days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
    activity_1: "",
    activity_2: "",
    activity_3: "",
    activity_4: "",
    summary: "",
  };

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from("private_tours")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error("Error loading private tours:", error);
      alert("Error loading tours");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTour) return;

    try {
      if (editingTour.id) {
        // Update
        const { error } = await client
          .from("private_tours")
          .update(editingTour)
          .eq("id", editingTour.id);

        if (error) throw error;
        alert("Tour updated successfully!");
      } else {
        // Create
        const { error } = await client
          .from("private_tours")
          .insert([editingTour]);

        if (error) throw error;
        alert("Tour created successfully!");
      }

      setEditingTour(null);
      setIsCreating(false);
      loadTours();
    } catch (error) {
      console.error("Error saving tour:", error);
      alert("Error saving tour");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;

    try {
      const { error } = await client
        .from("private_tours")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Tour deleted successfully!");
      loadTours();
    } catch (error) {
      console.error("Error deleting tour:", error);
      alert("Error deleting tour");
    }
  };

  const handleImageUpload = async (
    field: "image1" | "image2" | "image3",
    file: File
  ) => {
    if (!editingTour) return;

    try {
      const fileExt = file.name.split(".").pop();
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `gallery/${Date.now()}_${field}_${safeName}`;

      // get current user id for metadata (if available)
      let userId: string | null = null;
      try {
        const userResp: any = await client.auth.getUser();
        userId = userResp?.data?.user?.id || null;
      } catch (e) {
        // ignore - metadata will be null
        console.warn("Could not get user id for metadata", e);
      }

      const { data: uploadData, error: uploadError } = await client.storage
        .from("galery")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          metadata: userId ? { user_id: userId } : undefined,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(
          `Upload failed: ${
            uploadError?.message ??
            (uploadError as any).status ??
            String(uploadError)
          }`
        );
      }

      const { data: urlData } = client.storage
        .from("galery")
        .getPublicUrl(path);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Failed to get public URL");

      setEditingTour({ ...editingTour, [field]: publicUrl });
      alert("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(`Error uploading image: ${error.message || String(error)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Private Tours Management
          </h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingTour({ ...emptyTour });
          }}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Tour
        </button>
      </div>

      {/* Tours List */}
      {!editingTour && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={tour.image1 || "/placeholder.jpg"}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {tour.title}
                </h3>
                <div
                  className="text-gray-600 text-sm mb-4 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: formatTextToHtml(tour.description) }}
                />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-teal-600 font-semibold">
                    From ${tour.price_1_person}/person
                  </span>
                  <span className="text-gray-500 text-sm">{tour.duration}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingTour(tour)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => tour.id && handleDelete(tour.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Form */}
      {editingTour && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isCreating ? "Create New Tour" : "Edit Tour"}
            </h2>
            <button
              onClick={() => {
                setEditingTour(null);
                setIsCreating(false);
              }}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Title *
              </label>
              <input
                type="text"
                value={editingTour.title}
                onChange={(e) =>
                  setEditingTour({ ...editingTour, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter tour title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editingTour.description}
                onChange={(e) =>
                  setEditingTour({
                    ...editingTour,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter tour description"
              />
              {/* Live preview for description */}
              <div className="mt-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Preview</div>
                <div className="prose max-w-none p-3 bg-gray-50 border rounded-lg text-gray-800" dangerouslySetInnerHTML={{ __html: formatTextToHtml(editingTour.description) }} />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Images (3 images)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["image1", "image2", "image3"] as const).map((field, idx) => (
                  <div key={field} className="space-y-2">
                    <label className="block text-xs text-gray-600">
                      Image {idx + 1}
                    </label>
                    {editingTour[field] && (
                      <img
                        src={editingTour[field]}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <input
                      type="text"
                      value={editingTour[field]}
                      onChange={(e) =>
                        setEditingTour({
                          ...editingTour,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="Image URL"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(field, file);
                      }}
                      className="w-full text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="w-5 h-5 inline mr-1" />
                Base Rates
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    1 Person
                  </label>
                  <input
                    type="number"
                    value={editingTour.price_1_person}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        price_1_person: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    2 Persons
                  </label>
                  <input
                    type="number"
                    value={editingTour.price_2_persons}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        price_2_persons: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    3 Persons
                  </label>
                  <input
                    type="number"
                    value={editingTour.price_3_persons}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        price_3_persons: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    4 Persons
                  </label>
                  <input
                    type="number"
                    value={editingTour.price_4_persons}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        price_4_persons: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Children (&lt;5)
                  </label>
                  <input
                    type="number"
                    value={editingTour.price_children_under_5}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        price_children_under_5: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Tour Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Included
              </label>
              <textarea
                value={editingTour.whats_included}
                onChange={(e) =>
                  setEditingTour({
                    ...editingTour,
                    whats_included: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="List what's included in the tour"
              />
              <div className="mt-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Preview (Included)</div>
                <div className="prose max-w-none p-3 bg-gray-50 border rounded-lg text-gray-800" dangerouslySetInnerHTML={{ __html: formatTextToHtml(editingTour.whats_included) }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Duration
              </label>
              <input
                type="text"
                value={editingTour.duration}
                onChange={(e) =>
                  setEditingTour({ ...editingTour, duration: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., 4 hours, Full day, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Notes
              </label>
              <textarea
                value={editingTour.tour_notes}
                onChange={(e) =>
                  setEditingTour({ ...editingTour, tour_notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Additional notes or important information"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary (max 100 characters)
              </label>
              <textarea
                value={editingTour.summary || ""}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 100);
                  setEditingTour({ ...editingTour, summary: value });
                }}
                maxLength={100}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Brief tour summary (will be shown in carousel)"
              />
              <div className="text-xs text-gray-500 mt-1">
                {(editingTour.summary || "").length}/100 characters
              </div>
            </div>

            {/* Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What Will We Do? (Tour Activities)
              </label>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-xs text-gray-600 mb-1">
                      Actividad {num}
                    </label>
                    <input
                      type="text"
                      value={editingTour[`activity_${num}` as keyof PrivateTour] as string || ""}
                      onChange={(e) =>
                        setEditingTour({
                          ...editingTour,
                          [`activity_${num}`]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder={`Describe activity ${num}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                  <label
                    key={day}
                    className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(editingTour.available_days || []).includes(day)}
                      onChange={(e) => {
                        const currentDays = editingTour.available_days || [];
                        const newDays = e.target.checked
                          ? [...currentDays, day]
                          : currentDays.filter((d) => d !== day);
                        setEditingTour({
                          ...editingTour,
                          available_days: newDays,
                        });
                      }}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {day}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Show Additional Options */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="show_additional"
                checked={editingTour.show_additional_options}
                onChange={(e) =>
                  setEditingTour({
                    ...editingTour,
                    show_additional_options: e.target.checked,
                  })
                }
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <label
                htmlFor="show_additional"
                className="text-sm font-medium text-gray-700"
              >
                Show additional options to customers
              </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                onClick={() => {
                  setEditingTour(null);
                  setIsCreating(false);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {tours.length === 0 && !editingTour && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏝️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Private Tours Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first private tour to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPrivateTours;
