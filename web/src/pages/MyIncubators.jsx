import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchIncubatorsByOwner } from "../services/api";
import fallbackImage from "../assets/images/fallback-product.jpg";

function MyIncubators() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [incubators, setIncubators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIncubators() {
      if (!currentUser) {
        setError("No logged user found.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchIncubatorsByOwner(currentUser.ID);
        setIncubators(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load incubators.");
      } finally {
        setLoading(false);
      }
    }

    loadIncubators();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-green-950">My Incubators</h1>
        <p className="text-gray-600 mt-1">
          Manage your incubators and hatching equipment
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate("/my-farm/incubators/add")}
          className="bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + Add Incubator
        </button>
      </div>

      {loading && <p className="text-green-700">Loading incubators...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && incubators.length === 0 && (
        <p className="text-gray-600">No incubators found for your farm.</p>
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
                alt={incubator.name}
                className="h-52 w-full object-cover bg-green-50"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="p-4">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-2">
                  {incubator.condition || "Unknown"}
                </span>

                <h2 className="text-xl font-bold text-gray-900">
                  {incubator.name}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>Capacity:</strong> {incubator.capacity || 0} eggs
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Notes:</strong> {incubator.notes || "No notes"}
                </p>

                <div className="mt-4">
                  <button
                    onClick={() =>
                    navigate(`/my-farm/incubators/${incubator.ID}/cycles`, {
                    state: { incubator },
                      })
                      }
                      className="w-full bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                      >
                    View Cycles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyIncubators;