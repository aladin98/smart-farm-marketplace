import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import {
  fetchFarmAnimalsByOwner,
  fetchIncubatorsByOwner,
  fetchIncubationCycles,
  fetchPlacesByOwner,
  fetchCagesByOwner,
  fetchEquipmentsByOwner,
} from "../services/api";

function MyFarm() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

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
      if (!currentUser) {
        setError("No logged user found.");
        setLoading(false);
        return;
      }

      try {
        const [
          animals,
          incubators,
          cycles,
          places,
          cages,
          equipments,
        ] = await Promise.all([
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
      } catch (err) {
  console.error("MyFarm dashboard error:", err);
  setError(`Failed to load farm dashboard: ${err.message}`);
} finally {
        setLoading(false);
      }
    }

    loadFarmData();
  }, [currentUser]);

  const cards = [
  { title: "Animals", value: stats.animals, icon: "🐥", path: "/my-farm/animals" },
  { title: "Incubators", value: stats.incubators, icon: "🥚", path: "/my-farm/incubators" },
  { title: "Cycles", value: stats.cycles, icon: "🔄" },
  { title: "Places", value: stats.places, icon: "📍", path: "/my-farm/places" },
  { title: "Cages", value: stats.cages, icon: "🪺", path: "/my-farm/cages" },
  { title: "Equipments", value: stats.equipments, icon: "🧰", path: "/my-farm/equipments" },
];

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-950">My Farm</h1>
        <p className="text-gray-600 mt-1">
          Manage your farm activities and resources
        </p>
      </div>

      {loading && <p className="text-green-700">Loading farm dashboard...</p>}
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
    </div>
  );
}

export default MyFarm;