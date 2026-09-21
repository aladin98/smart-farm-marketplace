import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { createCage, fetchPlacesByOwner } from "../services/api";
import { useTranslation } from "react-i18next";

function AddCage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    place_ID: "",
    cageNumber: "",
    capacity: "",
    notes: "",
  });

  useEffect(() => {
    async function loadPlaces() {
      if (!currentUser) return;

      try {
        const data = await fetchPlacesByOwner(currentUser.ID);
        setPlaces(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            place_ID: data[0].ID,
          }));
        }
      } catch (error) {
        console.error(error);
        setMessage(t("failedToLoadPlaces"));
      } finally {
        setLoadingPlaces(false);
      }
    }

    loadPlaces();
  }, [currentUser, t]);

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
      setMessage(t("mustBeLoggedInToAddCage"));
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        owner_ID: currentUser.ID,
        place_ID: formData.place_ID,
        cageNumber: formData.cageNumber,
        capacity: parseInt(formData.capacity, 10),
        notes: formData.notes,
      };

      await createCage(payload);

      setMessage(t("cageAddedSuccessfully"));

      setTimeout(() => {
        navigate("/my-farm/cages");
      }, 1000);
    } catch (error) {
      console.error("Add cage error:", error);
      setMessage(`${t("failedToAddCage")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/my-farm/cages")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("addCage")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("addCageSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("place")}
            </label>
            <select
              name="place_ID"
              value={formData.place_ID}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              disabled={loadingPlaces}
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
              {t("cageNumber")}
            </label>
            <input
              type="text"
              name="cageNumber"
              value={formData.cageNumber}
              onChange={handleChange}
              placeholder={t("cageNumberExample")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("capacity")}
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder={t("enterCageCapacity")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("notes")}
            </label>
            <textarea
              rows="4"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t("cageNotesPlaceholder")}
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
            {submitting ? t("adding") : t("addCage")}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default AddCage;