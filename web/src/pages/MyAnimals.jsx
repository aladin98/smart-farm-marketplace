import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchFarmAnimalsByOwner, deleteFarmAnimal } from "../services/api";
import fallbackImage from "../assets/images/fallback-product.jpg";

function MyAnimals() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnimals() {
      if (!currentUser) {
        setError("No logged user found.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchFarmAnimalsByOwner(currentUser.ID);
        setAnimals(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load animals.");
      } finally {
        setLoading(false);
      }
    }

    loadAnimals();
  }, [currentUser]);

  async function handleDelete(animalId) {
    const confirmed = window.confirm("Are you sure you want to delete this animal?");
    if (!confirmed) return;

    try {
      await deleteFarmAnimal(animalId);
      setAnimals((prev) => prev.filter((animal) => animal.ID !== animalId));
    } catch (error) {
      console.error(error);
      setError("Failed to delete animal.");
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
        <h1 className="text-3xl font-bold text-green-950">My Animals</h1>
        <p className="text-gray-600 mt-1">
          Manage the animals in your farm
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate("/my-farm/animals/add")}
          className="bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + Add Animal
        </button>
      </div>

      {loading && <p className="text-green-700">Loading animals...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && animals.length === 0 && (
        <p className="text-gray-600">No animals found for your farm.</p>
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
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-2">
                  {animal.animalType?.name || "Unknown type"}
                </span>

                <h2 className="text-xl font-bold text-gray-900">
                  {animal.customName || animal.variant?.name || "Unnamed Animal"}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>Variant:</strong> {animal.variant?.name || "N/A"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Group Number:</strong> {animal.groupNumber || "N/A"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Age:</strong> {animal.age || "N/A"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Source:</strong> {animal.sourceType || "N/A"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Place:</strong> {animal.place?.name || "N/A"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Cage:</strong> {animal.cage?.cageNumber || "N/A"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Quantity:</strong> {animal.quantity}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Notes:</strong> {animal.notes || "No notes"}
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
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(animal.ID)}
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

export default MyAnimals;