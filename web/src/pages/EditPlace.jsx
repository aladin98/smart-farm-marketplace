import BottomNav from "../components/BottomNav";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { updatePlace } from "../services/api";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";

function EditPlace() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const place = state?.place;
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: place?.name || "",
    placeNumber: place?.placeNumber || "",
    description: place?.description || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white p-6 rounded-[28px] shadow-sm text-center max-w-md w-full">
          <p className="text-xl font-semibold text-green-900">
            {t("placeNotFound")}
          </p>
          <button
            onClick={() => navigate("/my-farm/places")}
            className="mt-4 bg-green-700 text-white px-5 py-3 rounded-full"
          >
            {t("back")}
          </button>
        </div>

        <BottomNav />
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
      await updatePlace(place.ID, formData);
      setMessage(t("placeUpdatedSuccessfully"));

      setTimeout(() => {
        navigate("/my-farm/places");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToUpdatePlace")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/my-farm/places")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("editPlace")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("placeName")}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("placeNumber")}
            </label>
            <input
              type="text"
              name="placeNumber"
              value={formData.placeNumber}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("description")}
            </label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
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
            {submitting ? t("saving") : t("saveChanges")}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default EditPlace;