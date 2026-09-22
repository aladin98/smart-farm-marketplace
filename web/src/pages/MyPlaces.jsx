import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchPlacesByOwner, deletePlace } from "../services/api";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";

function MyPlaces() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlaces() {
      if (!currentUser) {
        setError(t("noLoggedUserFound"));
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPlacesByOwner(currentUser.ID);
        setPlaces(data);
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadPlaces"));
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [currentUser, t]);

  async function handleDelete(placeId) {
    const confirmed = window.confirm(t("areYouSureDeletePlace"));
    if (!confirmed) return;

    try {
      await deletePlace(placeId);
      setPlaces((prev) => prev.filter((place) => place.ID !== placeId));
    } catch (error) {
      console.error(error);
      setError(t("failedToDeletePlace"));
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myPlaces")}
        subtitle={t("managePlaces")}
        backTo="/my-farm"
      />

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
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                {t("place")}
              </span>

              <h2 className="text-xl font-bold text-gray-900">
                {place.name}
              </h2>

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