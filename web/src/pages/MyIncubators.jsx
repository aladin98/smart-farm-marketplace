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

const MODULE_NAME = "incubators";

function MyIncubators() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const config = offlineModules[MODULE_NAME];

  const [incubators, setIncubators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIncubators() {
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

        setIncubators(result.items);

        if (!isOnline && result.empty) {
          setError(t("noOfflineIncubatorsAvailable"));
        } else {
          setError("");
        }
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadIncubators"));
      } finally {
        setLoading(false);
      }
    }

    loadIncubators();
  }, [currentUser, t, isOnline, config]);

  async function handleDelete(incubatorId) {
    const confirmed = window.confirm(t("areYouSureDeleteIncubator"));
    if (!confirmed || !currentUser?.ID) return;

    const currentIncubator = incubators.find(
      (incubator) => incubator.ID === incubatorId
    );
    if (!currentIncubator) return;

    if (!isOnline) {
      const updatedCache = addOfflineDelete(
        MODULE_NAME,
        currentUser.ID,
        incubatorId,
        currentIncubator
      );

      setIncubators(updatedCache);
      setError("");
      return;
    }

    try {
      await config.deleteFn(incubatorId);

      const updatedIncubators = incubators.filter(
        (incubator) => incubator.ID !== incubatorId
      );
      setIncubators(updatedIncubators);
      setCachedItems(MODULE_NAME, currentUser.ID, updatedIncubators);
    } catch (error) {
      console.error(error);
      setError(`${t("failedToDeleteIncubator")}: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myIncubators")}
        subtitle={t("manageIncubators")}
        backTo="/my-farm"
      />

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6">
          <p className="text-orange-700 font-semibold">
            {t("offlineIncubatorsMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("showingCachedIncubators")}
          </p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate("/my-farm/incubators/add")}
          className="w-full sm:w-auto bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + {t("addIncubator")}
        </button>
      </div>

      {loading && <p className="text-green-700">{t("loadingIncubators")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && incubators.length === 0 && (
        <p className="text-gray-600">{t("noIncubatorsFound")}</p>
      )}

      {!loading && !error && incubators.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {incubators.map((incubator) => (
            <div
              key={incubator.ID}
              className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-green-50"
            >
              <img
                src={incubator.photoUrl || fallbackImage}
                alt={incubator.name || t("incubator")}
                className="h-52 w-full object-cover bg-green-50"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1">
                    {incubator.condition || t("unknown")}
                  </span>

                  {incubator.pendingSync && (
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium rounded-full px-3 py-1">
                      {t("pendingSync")}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  {incubator.name}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>{t("capacity")}:</strong> {incubator.capacity || 0}{" "}
                  {t("eggs")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("notes")}:</strong> {incubator.notes || t("noNotes")}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      navigate(`/my-farm/incubators/edit/${incubator.ID}`, {
                        state: { incubator },
                      })
                    }
                    className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                  >
                    {t("edit")}
                  </button>

                  <button
                    onClick={() => handleDelete(incubator.ID)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-full text-sm font-semibold border border-red-100"
                  >
                    {t("delete")}
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/my-farm/incubators/${incubator.ID}/cycles`, {
                        state: { incubator },
                      })
                    }
                    className="flex-1 bg-white text-green-700 border border-green-200 py-2 rounded-full text-sm font-semibold"
                  >
                    {t("viewCycles")}
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

export default MyIncubators;