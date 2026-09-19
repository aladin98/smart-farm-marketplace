import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchEquipmentsByOwner, deleteEquipment } from "../services/api";
import fallbackImage from "../assets/images/fallback-product.jpg";

function MyEquipments() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEquipments() {
      if (!currentUser) {
        setError("No logged user found.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchEquipmentsByOwner(currentUser.ID);
        setEquipments(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load equipments.");
      } finally {
        setLoading(false);
      }
    }

    loadEquipments();
  }, [currentUser]);

  async function handleDelete(equipmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this equipment?"
    );
    if (!confirmed) return;

    try {
      await deleteEquipment(equipmentId);
      setEquipments((prev) =>
        prev.filter((equipment) => equipment.ID !== equipmentId)
      );
    } catch (error) {
      console.error(error);
      setError("Failed to delete equipment.");
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
        <h1 className="text-3xl font-bold text-green-950">My Equipments</h1>
        <p className="text-gray-600 mt-1">
          Manage your farm tools and equipments
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate("/my-farm/equipments/add")}
          className="bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + Add Equipment
        </button>
      </div>

      {loading && <p className="text-green-700">Loading equipments...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && equipments.length === 0 && (
        <p className="text-gray-600">No equipments found for your farm.</p>
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
                alt={equipment.name}
                className="h-52 w-full object-cover bg-green-50"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="p-4">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-2">
                  {equipment.category || "Equipment"}
                </span>

                <h2 className="text-xl font-bold text-gray-900">
                  {equipment.name}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>Condition:</strong> {equipment.condition || "Unknown"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Quantity:</strong> {equipment.quantity || 0}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Notes:</strong> {equipment.notes || "No notes"}
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
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(equipment.ID)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-full text-sm font-semibold border border-red-100"
                  >
                    Delete
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

export default MyEquipments;