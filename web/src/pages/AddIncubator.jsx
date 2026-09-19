import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { createIncubator } from "../services/api";

function AddIncubator() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    condition: "New",
    capacity: "",
    notes: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (!currentUser) {
      setMessage("You must be logged in to add an incubator.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        owner_ID: currentUser.ID,
        name: formData.name,
        condition: formData.condition,
        capacity: parseInt(formData.capacity, 10),
        notes: formData.notes,
      };

      await createIncubator(payload);

      setMessage("Incubator added successfully!");

      setTimeout(() => {
        navigate("/my-farm/incubators");
      }, 1000);
    } catch (error) {
      console.error("Add incubator error:", error);
      setMessage(`Failed to add incubator: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm/incubators")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">Add Incubator</h1>
        <p className="text-gray-600 mb-6">
          Add a new incubator to your farm.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo preview only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incubator Photo
            </label>

            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-52 rounded-2xl overflow-hidden border border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Incubator Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green-700 text-sm">
                    No incubator photo selected
                  </span>
                )}
              </div>

              <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                Upload Incubator Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-gray-500 text-center">
                Photo preview only for now. Backend image upload will be added later.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incubator Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter incubator name"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Enter egg capacity"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows="4"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add notes"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            ></textarea>
          </div>

          {message && (
            <p className="text-sm font-medium text-center text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Incubator"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddIncubator;