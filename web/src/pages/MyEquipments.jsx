import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import fallbackImage from "../assets/images/fallback-product.jpg";
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

const MODULE_NAME = "equipments";

function MyEquipments() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const config = offlineModules[MODULE_NAME];

  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEquipments() {
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

        setEquipments(result.items);

        if (!isOnline && result.empty) {
          setError(t("noOfflineEquipmentsAvailable"));
        } else {
          setError("");
        }
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadEquipments"));
      } finally {
        setLoading(false);
      }
    }

    loadEquipments();
  }, [currentUser, t, isOnline, config]);

  async function handleDelete(equipmentId) {
    const confirmed = window.confirm(t("areYouSureDeleteEquipment"));
    if (!confirmed || !currentUser?.ID) return;

    const currentEquipment = equipments.find(
      (equipment) => equipment.ID === equipmentId
    );
    if (!currentEquipment) return;

    if (!isOnline) {
      const updatedCache = addOfflineDelete(
        MODULE_NAME,
        currentUser.ID,
        equipmentId,
        currentEquipment
      );

      setEquipments(updatedCache);
      setError("");
      return;
    }

    try {
      await config.deleteFn(equipmentId);

      const updatedEquipments = equipments.filter(
        (equipment) => equipment.ID !== equipmentId
      );
      setEquipments(updatedEquipments);
      setCachedItems(MODULE_NAME, currentUser.ID, updatedEquipments);
    } catch (error) {
      console.error(error);
      setError(`${t("failedToDeleteEquipment")}: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myEquipments")}
        subtitle={t("manageEquipments")}
        backTo="/my-farm"
      />

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6">
          <p className="text-orange-700 font-semibold">
            {t("offlineEquipmentsMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("showingCachedEquipments")}
          </p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate("/my-farm/equipments/add")}
          className="w-full sm:w-auto bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + {t("addEquipment")}
        </button>
      </div>

      {loading && <p className="text-green-700">{t("loadingEquipments")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && equipments.length === 0 && (
        <p className="text-gray-600">{t("noEquipmentsFound")}</p>
      )}

      {!loading && !error && equipments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {equipments.map((equipment) => (
            <div
              key={equipment.ID}
              className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-green-50"
            >
              <img
                src={equipment.photoUrl || fallbackImage}
                alt={equipment.name || t("equipment")}
                className="h-52 w-full object-cover bg-green-50"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1">
                    {equipment.category || t("equipment")}
                  </span>

                  {equipment.pendingSync && (
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium rounded-full px-3 py-1">
                      {t("pendingSync")}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  {equipment.name}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>{t("condition")}:</strong>{" "}
                  {equipment.condition || t("unknown")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("quantity")}:</strong> {equipment.quantity || 0}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("notes")}:</strong> {equipment.notes || t("noNotes")}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      navigate(`/my-farm/equipments/edit/${equipment.ID}`, {
                        state: { equipment },
                      })
                    }
                    className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                  >
                    {t("edit")}
                  </button>

                  <button
                    onClick={() => handleDelete(equipment.ID)}
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

export default MyEquipments;