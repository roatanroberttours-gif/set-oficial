import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useSupabaseSet } from "../hooks/supabaseset";

interface Option {
  id?: number;
  title: string;
  subtitle?: string;
  features?: string;
  sort_order?: number;
}

const AdminAdditionalOptions: React.FC = () => {
  const client = useSupabaseSet();
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await client
        .from("tour_additional_options")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setOptions(data || []);
    } catch (error) {
      console.error("Error loading additional options:", error);
      alert("Error loading additional options");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingOption) return;
    try {
      if (editingOption.id) {
        const { error } = await client
          .from("tour_additional_options")
          .update(editingOption)
          .eq("id", editingOption.id);
        if (error) throw error;
        alert("Option updated");
      } else {
        const { error } = await client
          .from("tour_additional_options")
          .insert([editingOption]);
        if (error) throw error;
        alert("Option created");
      }
      setEditingOption(null);
      setIsCreating(false);
      loadOptions();
    } catch (error) {
      console.error("Error saving option:", error);
      alert("Error saving option");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this option?")) return;
    try {
      const { error } = await client
        .from("tour_additional_options")
        .delete()
        .eq("id", id);
      if (error) throw error;
      alert("Option deleted");
      loadOptions();
    } catch (error) {
      console.error("Error deleting option:", error);
      alert("Error deleting option");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Additional Options</h1>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setEditingOption({
              title: "",
              subtitle: "",
              features: "",
              sort_order:
                (options.length
                  ? options[options.length - 1].sort_order ?? options.length
                  : 0) + 1,
            });
          }}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-4">
          {!editingOption && (
            <>
              {/* Desktop/table view */}
              <div className="hidden md:block">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Subtitle</th>
                      <th className="px-3 py-2">Features</th>
                      <th className="px-3 py-2">Sort</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((opt) => (
                      <tr key={opt.id} className="border-t">
                        <td className="px-3 py-2">{opt.id}</td>
                        <td className="px-3 py-2">{opt.title}</td>
                        <td className="px-3 py-2">{opt.subtitle}</td>
                        <td className="px-3 py-2">{opt.features}</td>
                        <td className="px-3 py-2">{opt.sort_order}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button
                            onClick={() => setEditingOption(opt)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {opt.id && (
                            <button
                              onClick={() => handleDelete(opt.id!)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/card view */}
              <div className="md:hidden space-y-4">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="bg-white rounded-lg shadow p-4 border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500">
                          ID: {opt.id}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {opt.title}
                        </h3>
                        {opt.subtitle && (
                          <div className="text-sm text-teal-600">
                            {opt.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingOption(opt)}
                          className="p-2 bg-blue-600 text-white rounded-lg"
                          aria-label={`Edit ${opt.title}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {opt.id && (
                          <button
                            onClick={() => handleDelete(opt.id!)}
                            className="p-2 bg-red-600 text-white rounded-lg"
                            aria-label={`Delete ${opt.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {opt.features && (
                      <div className="mt-3 text-sm text-gray-700">
                        <strong>Features:</strong> {opt.features}
                      </div>
                    )}

                    <div className="mt-3 text-sm text-gray-500">
                      Sort: {opt.sort_order}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {editingOption && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingOption.title}
                  onChange={(e) =>
                    setEditingOption({
                      ...editingOption,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editingOption.subtitle}
                  onChange={(e) =>
                    setEditingOption({
                      ...editingOption,
                      subtitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (comma separated)
                </label>
                <textarea
                  value={editingOption.features}
                  onChange={(e) =>
                    setEditingOption({
                      ...editingOption,
                      features: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={editingOption.sort_order}
                  onChange={(e) =>
                    setEditingOption({
                      ...editingOption,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-32 px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingOption(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2 inline" /> Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAdditionalOptions;
