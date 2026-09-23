import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchPlacesByOwner } from "../services/api";
import { useTranslation } from "react-i18next";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { addOfflineCreate, getCachedItems } from "../utils/offlineSync";
import { offlineModules } from "../utils/offlineModules";

const MODULE_NAME = "cages";

function AddCage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const config = offlineModules[MODULE_NAME];

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
      if (!currentUser?.ID) {
        setLoadingPlaces(false);
        return;
      }

      try {
        let data = [];

        if (isOnline) {
          data = await fetchPlacesByOwner(currentUser.ID);
        } else {
          data = getCachedItems("places", currentUser.ID);
        }

        setPlaces(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            place_ID: prev.place_ID || data[0].ID,
          }));
        } else if (!isOnline) {
          setMessage(t("noOfflinePlacesAvailable"));
        }
      } catch (error) {
        console.error(error);
        setMessage(t("failedToLoadPlaces"));
      } finally {
        setLoadingPlaces(false);
      }
    }

    loadPlaces();
  }, [currentUser, t, isOnline]);

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

    if (!currentUser?.ID) {
      setMessage(t("mustBeLoggedInToAddCage"));
      setSubmitting(false);
      return;
    }

    const parsedCapacity = parseInt(formData.capacity, 10);

    if (Number.isNaN(parsedCapacity) || parsedCapacity < 1) {
      setMessage(t("invalidCapacity"));
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        owner_ID: currentUser.ID,
        place_ID: formData.place_ID,
        cageNumber: formData.cageNumber,
        capacity: parsedCapacity,
        notes: formData.notes,
      };

      if (!isOnline) {
        const selectedPlace = places.find(
          (place) => place.ID === formData.place_ID
        );

        if (selectedPlace?.ID?.startsWith?.("offline-")) {
          setMessage(t("cannotLinkCageToUnsyncedPlace"));
          setSubmitting(false);
          return;
        }

        addOfflineCreate(MODULE_NAME, currentUser.ID, {
          ...payload,
          place: selectedPlace || null,
        });

        setMessage(t("cageSavedOffline"));

        setTimeout(() => {
          navigate("/my-farm/cages");
        }, 1000);

        return;
      }

      await config.createFn(payload);

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

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6 max-w-2xl mx-auto">
          <p className="text-orange-700 font-semibold">
            {t("offlineCagesMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("newCagesWillBeSavedOffline")}
          </p>
        </div>
      )}

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("addCage")}
        </h1>
        <p className="text-gray-600 mb-6">{t("addCageSubtitle")}</p>

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
            disabled={submitting || loadingPlaces}
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