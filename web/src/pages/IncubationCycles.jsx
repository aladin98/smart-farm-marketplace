import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchIncubationCyclesByIncubator,
  deleteIncubationCycle,
} from "../services/api";

function IncubationCycles() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const incubator = state?.incubator;

  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCycles() {
      if (!incubator) {
        setError("Incubator not found.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchIncubationCyclesByIncubator(incubator.ID);
        setCycles(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load incubation cycles.");
      } finally {
        setLoading(false);
      }
    }

    loadCycles();
  }, [incubator]);

  async function handleDelete(cycleId) {
    const confirmed = window.confirm("Are you sure you want to delete this cycle?");
    if (!confirmed) return;

    try {
      await deleteIncubationCycle(cycleId);
      setCycles((prev) => prev.filter((cycle) => cycle.ID !== cycleId));
    } catch (error) {
      console.error(error);
      setError("Failed to delete cycle.");
    }
  }

  if (!incubator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            Incubator not found
          </h2>
          <button
            onClick={() => navigate("/my-farm/incubators")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            Back to Incubators
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm/incubators")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-green-950">Incubation Cycles</h1>
        <p className="text-gray-600 mt-1">
          {incubator.name} - manage incubation schedule and hatching process
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() =>
            navigate(`/my-farm/incubators/${incubator.ID}/cycles/add`, {
              state: { incubator },
            })
          }
          className="bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + Add Cycle
        </button>
      </div>

      {loading && <p className="text-green-700">Loading cycles...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && cycles.length === 0 && (
        <p className="text-gray-600">No incubation cycles found.</p>
      )}

      {!loading && !error && cycles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cycles.map((cycle) => (
            <div
              key={cycle.ID}
              className="bg-white rounded-[24px] shadow-sm p-5 border border-green-50"
            >
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                {cycle.status || "Unknown"}
              </span>

              <h2 className="text-xl font-bold text-gray-900">
                {cycle.eggsCount} eggs
              </h2>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p><strong>Start Date:</strong> {cycle.startDate}</p>
                <p><strong>Check Date:</strong> {cycle.checkDate}</p>
                <p><strong>Stop Date:</strong> {cycle.stopDate}</p>
                <p><strong>Hatch Date:</strong> {cycle.hatchDate}</p>
                <p><strong>Notes:</strong> {cycle.notes || "No notes"}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    navigate(
                      `/my-farm/incubators/${incubator.ID}/cycles/edit/${cycle.ID}`,
                      {
                        state: { cycle, incubator },
                      }
                    )
                  }
                  className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(cycle.ID)}
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

export default IncubationCycles;