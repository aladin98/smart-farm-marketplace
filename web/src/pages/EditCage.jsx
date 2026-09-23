import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchPlacesByOwner } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { useTranslation } from "react-i18next";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { addOfflineUpdate, getCachedItems } from "../utils/offlineSync";
import { offlineModules } from "../utils/offlineModules";
import { getEntityFromStateOrCache } from "../utils/getEntityFromStateOrCache";

const MODULE_NAME = "cages";

function EditCage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const config = offlineModules[MODULE_NAME];

  const cage = getEntityFromStateOrCache({
    state,
    stateKey: "cage",
    id,
    moduleName: MODULE_NAME,
    userId: currentUser?.ID,
  });

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
    if (!cage) return;

    setFormData({
      place_ID: cage.place_ID || "",
      cageNumber: cage.cageNumber || "",
      capacity: cage.capacity || "",
      notes: cage.notes || "",
    });
  }, [cage]);

  useEffect(() => {
    async function loadPlaces() {
      if (!currentUser?.ID) return;

      try {
        let data = [];

        if (isOnline) {
          data = await fetchPlacesByOwner(currentUser.ID);
        } else {
          data = getCachedItems("places", currentUser.ID);
        }

        setPlaces(data);
      } catch (error) {
        console.error(error);
        setMessage(t("failedToLoadPlaces"));
      }
    }

    loadPlaces();
  }, [currentUser, t, isOnline]);

  if (!cage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white p-6 rounded-[28px] shadow-sm text-center max-w-md w-full">
          <p className="text-xl font-semibold text-green-900">
            {t("cageNotFound")}
          </p>
          <button
            onClick={() => navigate("/my-farm/cages")}
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

    const parsedCapacity = parseInt(formData.capacity, 10);

    if (Number.isNaN(parsedCapacity) || parsedCapacity < 1) {
      setMessage(t("invalidCapacity"));
      setSubmitting(false);
      return;
    }

    try {
      if (!isOnline && currentUser?.ID) {
        const selectedPlace = places.find(
          (place) => place.ID === formData.place_ID
        );

        if (selectedPlace?.ID?.startsWith?.("offline-")) {
          setMessage(t("cannotLinkCageToUnsyncedPlace"));
          setSubmitting(false);
          return;
        }

        addOfflineUpdate(MODULE_NAME, currentUser.ID, cage, {
          place_ID: formData.place_ID,
          cageNumber: formData.cageNumber,
          capacity: parsedCapacity,
          notes: formData.notes,
          place: selectedPlace || cage.place || null,
        });

        setMessage(t("cageUpdatedOffline"));

        setTimeout(() => {
          navigate("/my-farm/cages");
        }, 1000);

        return;
      }

      await config.updateFn(cage.ID, {
        place_ID: formData.place_ID,
        cageNumber: formData.cageNumber,
        capacity: parsedCapacity,
        notes: formData.notes,
      });

      setMessage(t("cageUpdatedSuccessfully"));

      setTimeout(() => {
        navigate("/my-farm/cages");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToUpdateCage")}: ${error.message}`);
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

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6 max-w-2xl mx-auto">
          <p className="text-orange-700 font-semibold">
            {t("offlineCagesMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("cageUpdatesWillBeSavedOffline")}
          </p>
        </div>
      )}

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("editCage")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("place")}
            </label>
            <select
              name="place_ID"
              value={formData.place_ID}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            >
              <option value="">{t("selectPlace")}</option>
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

export default EditCage;