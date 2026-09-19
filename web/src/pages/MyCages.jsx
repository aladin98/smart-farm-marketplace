import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchCagesByOwner, deleteCage } from "../services/api";

function MyCages() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCages() {
      if (!currentUser) {
        setError("No logged user found.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCagesByOwner(currentUser.ID);
        setCages(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load cages.");
      } finally {
        setLoading(false);
      }
    }

    loadCages();
  }, [currentUser]);

  async function handleDelete(cageId) {
    const confirmed = window.confirm("Are you sure you want to delete this cage?");
    if (!confirmed) return;

    try {
      await deleteCage(cageId);
      setCages((prev) => prev.filter((cage) => cage.ID !== cageId));
    } catch (error) {
      console.error(error);
      setError("Failed to delete cage.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-green-950">My Cages</h1>
        <p className="text-gray-600 mt-1">
          Manage your cages and capacities
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate("/my-farm/cages/add")}
          className="bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + Add Cage
        </button>
      </div>

      {loading && <p className="text-green-700">Loading cages...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && cages.length === 0 && (
        <p className="text-gray-600">No cages found for your farm.</p>
      )}

      {!loading && !error && cages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cages.map((cage) => (
            <div
              key={cage.ID}
              className="bg-white rounded-[24px] shadow-sm p-5 border border-green-50"
            >
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                Cage
              </span>

              <h2 className="text-xl font-bold text-gray-900">
                {cage.cageNumber}
              </h2>

              <p className="text-sm text-gray-600 mt-2">
                <strong>Place:</strong> {cage.place?.name || "Unknown"}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                <strong>Capacity:</strong> {cage.capacity || 0}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                <strong>Notes:</strong> {cage.notes || "No notes"}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/my-farm/cages/edit/${cage.ID}`, {
                      state: { cage },
                    })
                  }
                  className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(cage.ID)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-full text-sm font-semibold border border-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCages;