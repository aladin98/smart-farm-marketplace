import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { createPlace } from "../services/api";

function AddPlace() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    name: "",
    placeNumber: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (!currentUser) {
      setMessage("You must be logged in to add a place.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        owner_ID: currentUser.ID,
        name: formData.name,
        placeNumber: formData.placeNumber,
        description: formData.description,
      };

      await createPlace(payload);

      setMessage("Place added successfully!");

      setTimeout(() => {
        navigate("/my-farm/places");
      }, 1000);
    } catch (error) {
      console.error("Add place error:", error);
      setMessage(`Failed to add place: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm/places")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">Add Place</h1>
        <p className="text-gray-600 mb-6">
          Add a new place or section in your farm.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter place name"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place Number
            </label>
            <input
              type="text"
              name="placeNumber"
              value={formData.placeNumber}
              onChange={handleChange}
              placeholder="e.g. P01"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this place"
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
            {submitting ? "Adding..." : "Add Place"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddPlace;