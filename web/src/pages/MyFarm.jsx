import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import BottomNav from "../components/BottomNav";
import { useTranslation } from "react-i18next";
import {
  fetchFarmAnimalsByOwner,
  fetchIncubatorsByOwner,
  fetchIncubationCycles,
  fetchPlacesByOwner,
  fetchCagesByOwner,
  fetchEquipmentsByOwner,
} from "../services/api";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { getCachedItems } from "../utils/offlineSync";

function MyFarm() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  const [stats, setStats] = useState({
    animals: 0,
    incubators: 0,
    cycles: 0,
    places: 0,
    cages: 0,
    equipments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFarmData() {
      if (!currentUser?.ID) {
        setError(t("noLoggedUserFound"));
        setLoading(false);
        return;
      }

      try {
        if (!isOnline) {
          const cachedAnimals = getCachedItems("animals", currentUser.ID);
          const cachedIncubators = getCachedItems("incubators", currentUser.ID);
          const cachedPlaces = getCachedItems("places", currentUser.ID);
          const cachedCages = getCachedItems("cages", currentUser.ID);
          const cachedEquipments = getCachedItems("equipments", currentUser.ID);

          setStats({
            animals: cachedAnimals.length,
            incubators: cachedIncubators.length,
            cycles: 0,
            places: cachedPlaces.length,
            cages: cachedCages.length,
            equipments: cachedEquipments.length,
          });

          setError("");
          setLoading(false);
          return;
        }

        const [animals, incubators, cycles, places, cages, equipments] =
          await Promise.all([
            fetchFarmAnimalsByOwner(currentUser.ID),
            fetchIncubatorsByOwner(currentUser.ID),
            fetchIncubationCycles(),
            fetchPlacesByOwner(currentUser.ID),
            fetchCagesByOwner(currentUser.ID),
            fetchEquipmentsByOwner(currentUser.ID),
          ]);

        const userCycles = cycles.filter(
          (cycle) => cycle.incubator?.owner_ID === currentUser.ID
        );

        setStats({
          animals: animals.length,
          incubators: incubators.length,
          cycles: userCycles.length,
          places: places.length,
          cages: cages.length,
          equipments: equipments.length,
        });

        setError("");
      } catch (err) {
        console.error("MyFarm dashboard error:", err);

        try {
          const cachedAnimals = getCachedItems("animals", currentUser.ID);
          const cachedIncubators = getCachedItems("incubators", currentUser.ID);
          const cachedPlaces = getCachedItems("places", currentUser.ID);
          const cachedCages = getCachedItems("cages", currentUser.ID);
          const cachedEquipments = getCachedItems("equipments", currentUser.ID);

          if (
            cachedAnimals.length ||
            cachedIncubators.length ||
            cachedPlaces.length ||
            cachedCages.length ||
            cachedEquipments.length
          ) {
            setStats({
              animals: cachedAnimals.length,
              incubators: cachedIncubators.length,
              cycles: 0,
              places: cachedPlaces.length,
              cages: cachedCages.length,
              equipments: cachedEquipments.length,
            });

            setError("");
          } else {
            setError(`${t("failedToLoadFarmDashboard")}: ${err.message}`);
          }
        } catch {
          setError(`${t("failedToLoadFarmDashboard")}: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }

    loadFarmData();
  }, [currentUser, t, isOnline]);

  const cards = [
    {
      title: t("animals"),
      value: stats.animals,
      icon: "🐥",
      path: "/my-farm/animals",
    },
    {
      title: t("incubators"),
      value: stats.incubators,
      icon: "🥚",
      path: "/my-farm/incubators",
    },
    {
      title: t("cycles"),
      value: stats.cycles,
      icon: "🔄",
      path: "/my-farm/incubators",
    },
    {
      title: t("places"),
      value: stats.places,
      icon: "📍",
      path: "/my-farm/places",
    },
    {
      title: t("cages"),
      value: stats.cages,
      icon: "🪺",
      path: "/my-farm/cages",
    },
    {
      title: t("equipments"),
      value: stats.equipments,
      icon: "🧰",
      path: "/my-farm/equipments",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-950">{t("myFarm")}</h1>
        <p className="text-gray-600 mt-1">{t("manageFarmActivities")}</p>
      </div>

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6">
          <p className="text-orange-700 font-semibold">
            {t("offlineFarmMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("showingCachedFarmStats")}
          </p>
        </div>
      )}

      {loading && <p className="text-green-700">{t("loadingFarmDashboard")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => card.path && navigate(card.path)}
              className={`bg-white rounded-[24px] shadow-sm p-5 border border-green-50 ${
                card.path ? "cursor-pointer hover:shadow-md transition" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <h2 className="text-3xl font-bold text-green-900 mt-2">
                    {card.value}
                  </h2>
                </div>
                <div className="text-4xl">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default MyFarm;