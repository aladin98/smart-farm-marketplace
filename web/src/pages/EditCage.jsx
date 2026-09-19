import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPlacesByOwner, updateCage } from "../services/api";
import { getCurrentUser } from "../services/auth";

function EditCage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cage = state?.cage;
  const currentUser = getCurrentUser();

  const [places, setPlaces] = useState([]);
  const [formData, setFormData] = useState({
    place_ID: cage?.place_ID || "",
    cageNumber: cage?.cageNumber || "",
    capacity: cage?.capacity || "",
    notes: cage?.notes || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPlaces() {
      if (!currentUser) return;
      try {
        const data = await fetchPlacesByOwner(currentUser.ID);
        setPlaces(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPlaces();
  }, [currentUser]);

  if (!cage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2]">
        <div className="bg-white p-6 rounded-[28px] shadow-sm text-center">
          <p className="text-xl font-semibold text-green-900">Cage not found</p>
          <button
            onClick={() => navigate("/my-farm/cages")}
            className="mt-4 bg-green-700 text-white px-5 py-3 rounded-full"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await updateCage(cage.ID, {
        place_ID: formData.place_ID,
        cageNumber: formData.cageNumber,
        capacity: parseInt(formData.capacity, 10),
        notes: formData.notes,
      });

      setMessage("Cage updated successfully!");

      setTimeout(() => {
        navigate("/my-farm/cages");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`Failed to update cage: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm/cages")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">Edit Cage</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place
            </label>
            <select
              name="place_ID"
              value={formData.place_ID}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
              required
            >
              {places.map((place) => (
                <option key={place.ID} value={place.ID}>
                  {place.name} ({place.placeNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cage Number
            </label>
            <input
              type="text"
              name="cageNumber"
              value={formData.cageNumber}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
              required
            />
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
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
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
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
            />
          </div>

          {message && (
            <p className="text-sm text-center text-green-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditCage;