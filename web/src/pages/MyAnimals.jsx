import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import {
  fetchFarmAnimalsByOwner,
  deleteFarmAnimal,
  createFarmAnimal,
  updateFarmAnimal,
} from "../services/api";
import fallbackImage from "../assets/images/fallback-product.jpg";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "react-i18next";

const getAnimalsCacheKey = (userId) => `myFarmAnimalsCache_${userId}`;
const getAnimalsPendingKey = (userId) => `myFarmAnimalsPending_${userId}`;

function MyAnimals() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);

  async function syncPendingAnimals(userId) {
    const pendingKey = getAnimalsPendingKey(userId);
    const pendingAnimals = JSON.parse(localStorage.getItem(pendingKey) || "[]");

    if (pendingAnimals.length === 0) return;

    const stillPending = [];

    for (const animal of pendingAnimals) {
      try {
        const payload = {
          owner_ID: animal.owner_ID,
          animalType_ID: animal.animalType_ID,
          customName: animal.customName,
          groupNumber: animal.groupNumber,
          age: animal.age,
          sourceType: animal.sourceType,
          quantity: animal.quantity,
          notes: animal.notes,
          photoUrl: animal.photoUrl,
        };

        if (animal.variant_ID) payload.variant_ID = animal.variant_ID;
        if (animal.place_ID) payload.place_ID = animal.place_ID;
        if (animal.cage_ID) payload.cage_ID = animal.cage_ID;

        if (animal.syncAction === "delete") {
          if (!String(animal.ID).startsWith("offline-")) {
            await deleteFarmAnimal(animal.ID);
          }
        } else if (
          animal.syncAction === "update" &&
          !String(animal.ID).startsWith("offline-")
        ) {
          await updateFarmAnimal(animal.ID, payload);
        } else {
          await createFarmAnimal(payload);
        }
      } catch (error) {
        console.error("Failed to sync animal:", error);
        stillPending.push(animal);
      }
    }

    localStorage.setItem(pendingKey, JSON.stringify(stillPending));
  }

  useEffect(() => {
    function handleOnline() {
      setIsOfflineMode(false);
    }

    function handleOffline() {
      setIsOfflineMode(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    async function loadAnimals() {
      if (!currentUser) {
        setError(t("noLoggedUserFound"));
        setLoading(false);
        return;
      }

      const cacheKey = getAnimalsCacheKey(currentUser.ID);

      if (!navigator.onLine) {
        try {
          const cachedAnimals = JSON.parse(localStorage.getItem(cacheKey) || "[]");
          setAnimals(cachedAnimals);

          if (cachedAnimals.length === 0) {
            setError(t("noOfflineAnimalsAvailable"));
          }
        } catch (err) {
          console.error(err);
          setError(t("failedToLoadAnimals"));
        } finally {
          setLoading(false);
        }

        return;
      }

      try {
        await syncPendingAnimals(currentUser.ID);

        const data = await fetchFarmAnimalsByOwner(currentUser.ID);
        setAnimals(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setError("");
      } catch (err) {
        console.error(err);

        try {
          const cachedAnimals = JSON.parse(localStorage.getItem(cacheKey) || "[]");

          if (cachedAnimals.length > 0) {
            setAnimals(cachedAnimals);
            setIsOfflineMode(true);
          } else {
            setError(t("failedToLoadAnimals"));
          }
        } catch {
          setError(t("failedToLoadAnimals"));
        }
      } finally {
        setLoading(false);
      }
    }

    loadAnimals();
  }, [currentUser, t]);

  async function handleDelete(animalId) {
    const confirmed = window.confirm(t("areYouSureDeleteAnimal"));
    if (!confirmed) return;

    if (!currentUser?.ID) return;

    const cacheKey = getAnimalsCacheKey(currentUser.ID);
    const pendingKey = getAnimalsPendingKey(currentUser.ID);

    const currentAnimal = animals.find((animal) => animal.ID === animalId);
    if (!currentAnimal) return;

    if (!navigator.onLine) {
      const cachedAnimals = JSON.parse(localStorage.getItem(cacheKey) || "[]");
      const pendingAnimals = JSON.parse(localStorage.getItem(pendingKey) || "[]");

      const updatedCache = cachedAnimals.filter((animal) => animal.ID !== animalId);

      let updatedPending;

      if (String(animalId).startsWith("offline-")) {
        // If it was created offline and not synced yet, remove it completely
        updatedPending = pendingAnimals.filter((animal) => animal.ID !== animalId);
      } else {
        // If it exists on backend, mark delete pending
        const withoutSame = pendingAnimals.filter((animal) => animal.ID !== animalId);

        updatedPending = [
          {
            ...currentAnimal,
            pendingSync: true,
            syncAction: "delete",
          },
          ...withoutSame,
        ];
      }

      localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      localStorage.setItem(pendingKey, JSON.stringify(updatedPending));

      setAnimals(updatedCache);
      setError("");
      return;
    }

    try {
      await deleteFarmAnimal(animalId);

      const updatedAnimals = animals.filter((animal) => animal.ID !== animalId);
      setAnimals(updatedAnimals);

      localStorage.setItem(cacheKey, JSON.stringify(updatedAnimals));
    } catch (error) {
      console.error(error);
      setError(t("failedToDeleteAnimal"));
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myAnimals")}
        subtitle={t("manageAnimals")}
        backTo="/my-farm"
      />

      {isOfflineMode && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6">
          <p className="text-orange-700 font-semibold">
            {t("offlineAnimalsMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("showingCachedAnimals")}
          </p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate("/my-farm/animals/add")}
          className="w-full sm:w-auto bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + {t("addAnimal")}
        </button>
      </div>

      {loading && <p className="text-green-700">{t("loadingAnimals")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && animals.length === 0 && (
        <p className="text-gray-600">{t("noAnimalsFound")}</p>
      )}

      {!loading && !error && animals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {animals.map((animal) => (
            <div
              key={animal.ID}
              className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-green-50"
            >
              <img
                src={animal.photoUrl || fallbackImage}
                alt={animal.customName || animal.animalType?.name}
                className="h-52 w-full object-cover bg-green-50"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1">
                    {animal.animalType?.name || t("unknownType")}
                  </span>

                  {animal.pendingSync && (
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium rounded-full px-3 py-1">
                      {t("pendingSync")}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  {animal.customName || animal.variant?.name || t("unnamedAnimal")}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>{t("variant")}:</strong> {animal.variant?.name || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("groupNumber")}:</strong> {animal.groupNumber || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("age")}:</strong> {animal.age || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("source")}:</strong> {animal.sourceType || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("place")}:</strong> {animal.place?.name || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("cage")}:</strong> {animal.cage?.cageNumber || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("quantity")}:</strong> {animal.quantity}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("notes")}:</strong> {animal.notes || t("noNotes")}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      navigate(`/my-farm/animals/edit/${animal.ID}`, {
                        state: { animal },
                      })
                    }
                    className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                  >
                    {t("edit")}
                  </button>

                  <button
                    onClick={() => handleDelete(animal.ID)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-full text-sm font-semibold border border-red-100"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default MyAnimals;