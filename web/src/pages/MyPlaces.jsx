import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { useTranslation } from "react-i18next";
import useOnlineStatus from "../hooks/useOnlineStatus";
import {
  loadWithOfflineSupport,
  addOfflineDelete,
  setCachedItems,
} from "../utils/offlineSync";
import { offlineModules } from "../utils/offlineModules";

const MODULE_NAME = "places";

function MyPlaces() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const config = offlineModules[MODULE_NAME];

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlaces() {
      if (!currentUser?.ID) {
        setError(t("noLoggedUserFound"));
        setLoading(false);
        return;
      }

      try {
        const result = await loadWithOfflineSupport({
          moduleName: MODULE_NAME,
          userId: currentUser.ID,
          fetchFn: () => config.fetchFn(currentUser.ID),
          syncConfig: {
            createFn: config.createFn,
            updateFn: config.updateFn,
            deleteFn: config.deleteFn,
            buildPayload: config.buildPayload,
          },
        });

        setPlaces(result.items);

        if (!isOnline && result.empty) {
          setError(t("noOfflinePlacesAvailable"));
        } else {
          setError("");
        }
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadPlaces"));
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [currentUser, t, isOnline, config]);

  async function handleDelete(placeId) {
    const confirmed = window.confirm(t("areYouSureDeletePlace"));
    if (!confirmed || !currentUser?.ID) return;

    const currentPlace = places.find((place) => place.ID === placeId);
    if (!currentPlace) return;

    if (!isOnline) {
      const updatedCache = addOfflineDelete(
        MODULE_NAME,
        currentUser.ID,
        placeId,
        currentPlace
      );
      setPlaces(updatedCache);
      setError("");
      return;
    }

    try {
      await config.deleteFn(placeId);
      const updatedPlaces = places.filter((place) => place.ID !== placeId);
      setPlaces(updatedPlaces);
      setCachedItems(MODULE_NAME, currentUser.ID, updatedPlaces);
    } catch (error) {
      console.error(error);
      setError(`${t("failedToDeletePlace")}: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myPlaces")}
        subtitle={t("managePlaces")}
        backTo="/my-farm"
      />

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6">
          <p className="text-orange-700 font-semibold">
            {t("offlinePlacesMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("showingCachedPlaces")}
          </p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate("/my-farm/places/add")}
          className="w-full sm:w-auto bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + {t("addPlace")}
        </button>
      </div>

      {loading && <p className="text-green-700">{t("loadingPlaces")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && places.length === 0 && (
        <p className="text-gray-600">{t("noPlacesFound")}</p>
      )}

      {!loading && !error && places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {places.map((place) => (
            <div
              key={place.ID}
              className="bg-white rounded-[24px] shadow-sm p-5 border border-green-50"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1">
                  {t("place")}
                </span>

                {place.pendingSync && (
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium rounded-full px-3 py-1">
                    {t("pendingSync")}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-900">{place.name}</h2>

              <p className="text-sm text-gray-600 mt-2">
                <strong>{t("placeNumber")}:</strong> {place.placeNumber}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                <strong>{t("description")}:</strong>{" "}
                {place.description || t("noDescription")}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/my-farm/places/edit/${place.ID}`, {
                      state: { place },
                    })
                  }
                  className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                >
                  {t("edit")}
                </button>

                <button
                  onClick={() => handleDelete(place.ID)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-full text-sm font-semibold border border-red-100"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default MyPlaces;