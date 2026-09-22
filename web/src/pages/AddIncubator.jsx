import BottomNav from "../components/BottomNav";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { createIncubator } from "../services/api";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";

function AddIncubator() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    condition: "New",
    capacity: "",
    notes: "",
    photoUrl: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedPhoto = await resizeImage(file, 1000, 700, 0.8);

      setPhotoPreview(resizedPhoto);
      setFormData((prev) => ({
        ...prev,
        photoUrl: resizedPhoto,
      }));
    } catch (error) {
      console.error(error);
      setMessage(t("failedToProcessImage"));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (!currentUser) {
      setMessage(t("mustBeLoggedInToAddIncubator"));
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
        photoUrl: formData.photoUrl,
      };

      await createIncubator(payload);

      setMessage(t("incubatorAddedSuccessfully"));

      setTimeout(() => {
        navigate("/my-farm/incubators");
      }, 1000);
    } catch (error) {
      console.error("Add incubator error:", error);
      setMessage(`${t("failedToAddIncubator")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/my-farm/incubators")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("addIncubator")}
        </h1>
        <p className="text-gray-600 mb-6">{t("addIncubatorSubtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("incubatorPhoto")}
            </label>

            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-52 rounded-2xl overflow-hidden border border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={t("incubatorPreview")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green-700 text-sm">
                    {t("noIncubatorPhotoSelected")}
                  </span>
                )}
              </div>

              <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                {t("uploadIncubatorPhoto")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-gray-500 text-center">
                {t("incubatorPhotoPreviewNote")}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("incubatorName")}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("enterIncubatorName")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("condition")}
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            >
              <option value="New">{t("new")}</option>
              <option value="Used">{t("used")}</option>
            </select>
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
              placeholder={t("enterEggCapacity")}
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
              placeholder={t("addNotes")}
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
            {submitting ? t("adding") : t("addIncubator")}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default AddIncubator;