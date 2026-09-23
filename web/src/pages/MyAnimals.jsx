import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import fallbackImage from "../assets/images/fallback-product.jpg";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "react-i18next";
import useOnlineStatus from "../hooks/useOnlineStatus";
import {
  loadWithOfflineSupport,
  addOfflineDelete,
  setCachedItems,
} from "../utils/offlineSync";
import { offlineModules } from "../utils/offlineModules";

const MODULE_NAME = "animals";

function MyAnimals() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const config = offlineModules[MODULE_NAME];

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnimals() {
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

        setAnimals(result.items);

        if (!isOnline && result.empty) {
          setError(t("noOfflineAnimalsAvailable"));
        } else {
          setError("");
        }
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadAnimals"));
      } finally {
        setLoading(false);
      }
    }

    loadAnimals();
  }, [currentUser, t, isOnline, config]);

  async function handleDelete(animalId) {
    const confirmed = window.confirm(t("areYouSureDeleteAnimal"));
    if (!confirmed || !currentUser?.ID) return;

    const currentAnimal = animals.find((animal) => animal.ID === animalId);
    if (!currentAnimal) return;

    if (!isOnline) {
      const updatedCache = addOfflineDelete(
        MODULE_NAME,
        currentUser.ID,
        animalId,
        currentAnimal
      );

      setAnimals(updatedCache);
      setError("");
      return;
    }

    try {
      await config.deleteFn(animalId);

      const updatedAnimals = animals.filter((animal) => animal.ID !== animalId);
      setAnimals(updatedAnimals);
      setCachedItems(MODULE_NAME, currentUser.ID, updatedAnimals);
    } catch (error) {
      console.error(error);
      setError(`${t("failedToDeleteAnimal")}: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myAnimals")}
        subtitle={t("manageAnimals")}
        backTo="/my-farm"
      />

      {!isOnline && (
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
                alt={
                  animal.customName ||
                  animal.variant?.name ||
                  animal.animalType?.name ||
                  t("unnamedAnimal")
                }
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
                  <strong>{t("variant")}:</strong>{" "}
                  {animal.variant?.name || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("groupNumber")}:</strong>{" "}
                  {animal.groupNumber || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("age")}:</strong> {animal.age || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("source")}:</strong>{" "}
                  {animal.sourceType || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("place")}:</strong>{" "}
                  {animal.place?.name || t("notAvailable")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("cage")}:</strong>{" "}
                  {animal.cage?.cageNumber || t("notAvailable")}
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