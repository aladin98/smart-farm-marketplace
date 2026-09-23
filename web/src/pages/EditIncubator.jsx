import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";
import { getCurrentUser } from "../services/auth";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { addOfflineUpdate } from "../utils/offlineSync";
import { offlineModules } from "../utils/offlineModules";
import { getEntityFromStateOrCache } from "../utils/getEntityFromStateOrCache";

const MODULE_NAME = "incubators";

function EditIncubator() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const config = offlineModules[MODULE_NAME];

  const incubator = getEntityFromStateOrCache({
    state,
    stateKey: "incubator",
    id,
    moduleName: MODULE_NAME,
    userId: currentUser?.ID,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(incubator?.photoUrl || "");

  const [formData, setFormData] = useState({
    name: incubator?.name || "",
    condition: incubator?.condition || "New",
    capacity: incubator?.capacity || "",
    notes: incubator?.notes || "",
    photoUrl: incubator?.photoUrl || "",
  });

  useEffect(() => {
    if (!incubator) return;

    setPhotoPreview(incubator.photoUrl || "");
    setFormData({
      name: incubator.name || "",
      condition: incubator.condition || "New",
      capacity: incubator.capacity || "",
      notes: incubator.notes || "",
      photoUrl: incubator.photoUrl || "",
    });
  }, [incubator]);

  if (!incubator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white p-6 rounded-[28px] shadow-sm text-center max-w-md w-full">
          <p className="text-xl font-semibold text-green-900">
            {t("incubatorNotFound")}
          </p>
          <button
            onClick={() => navigate("/my-farm/incubators")}
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

    const parsedCapacity = parseInt(formData.capacity, 10);

    if (Number.isNaN(parsedCapacity) || parsedCapacity < 1) {
      setMessage(t("invalidCapacity"));
      setSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name,
      condition: formData.condition,
      capacity: parsedCapacity,
      notes: formData.notes,
      photoUrl: formData.photoUrl,
    };

    try {
      if (!isOnline && currentUser?.ID) {
        addOfflineUpdate(MODULE_NAME, currentUser.ID, incubator, payload);

        setMessage(t("incubatorUpdatedOffline"));

        setTimeout(() => {
          navigate("/my-farm/incubators");
        }, 1000);

        return;
      }

      await config.updateFn(incubator.ID, payload);

      setMessage(t("incubatorUpdatedSuccessfully"));

      setTimeout(() => {
        navigate("/my-farm/incubators");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToUpdateIncubator")}: ${error.message}`);
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

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6 max-w-2xl mx-auto">
          <p className="text-orange-700 font-semibold">
            {t("offlineIncubatorsMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("incubatorUpdatesWillBeSavedOffline")}
          </p>
        </div>
      )}

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("editIncubator")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
                {t("changePhoto")}
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
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
              min="1"
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
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            ></textarea>
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

export default EditIncubator;