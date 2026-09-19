import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchPlacesByOwner, deletePlace } from "../services/api";

function MyPlaces() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlaces() {
      if (!currentUser) {
        setError("No logged user found.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPlacesByOwner(currentUser.ID);
        setPlaces(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load places.");
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [currentUser]);

  async function handleDelete(placeId) {
    const confirmed = window.confirm("Are you sure you want to delete this place?");
    if (!confirmed) return;

    try {
      await deletePlace(placeId);
      setPlaces((prev) => prev.filter((place) => place.ID !== placeId));
    } catch (error) {
      console.error(error);
      setError("Failed to delete place.");
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
        <h1 className="text-3xl font-bold text-green-950">My Places</h1>
        <p className="text-gray-600 mt-1">
          Manage your farm places and sections
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate("/my-farm/places/add")}
          className="bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + Add Place
        </button>
      </div>

      {loading && <p className="text-green-700">Loading places...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && places.length === 0 && (
        <p className="text-gray-600">No places found for your farm.</p>
      )}

      {!loading && !error && places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {places.map((place) => (
            <div
              key={place.ID}
              className="bg-white rounded-[24px] shadow-sm p-5 border border-green-50"
            >
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                Place
              </span>

              <h2 className="text-xl font-bold text-gray-900">
                {place.name}
              </h2>

              <p className="text-sm text-gray-600 mt-2">
                <strong>Place Number:</strong> {place.placeNumber}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                <strong>Description:</strong> {place.description || "No description"}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/my-farm/places/edit/${place.ID}`, {
                      state: { place },
                    })
                  }
                  className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(place.ID)}
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

export default MyPlaces;