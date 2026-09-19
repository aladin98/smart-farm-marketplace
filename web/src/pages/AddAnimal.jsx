import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAnimalTypes,
  fetchAnimalVariants,
  fetchPlacesByOwner,
  fetchCagesByOwner,
  createFarmAnimal,
} from "../services/api";
import { getCurrentUser } from "../services/auth";

function AddAnimal() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [animalTypes, setAnimalTypes] = useState([]);
  const [animalVariants, setAnimalVariants] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);

  const [places, setPlaces] = useState([]);
  const [cages, setCages] = useState([]);
  const [filteredCages, setFilteredCages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  const [formData, setFormData] = useState({
    animalType_ID: "",
    variant_ID: "",
    place_ID: "",
    cage_ID: "",
    customName: "",
    groupNumber: "",
    age: "",
    sourceType: "Hatched",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      if (!currentUser) {
        setMessage("No logged user found.");
        setLoading(false);
        return;
      }

      try {
        const [types, variants, userPlaces, userCages] = await Promise.all([
          fetchAnimalTypes(),
          fetchAnimalVariants(),
          fetchPlacesByOwner(currentUser.ID),
          fetchCagesByOwner(currentUser.ID),
        ]);

        setAnimalTypes(types);
        setAnimalVariants(variants);
        setPlaces(userPlaces);
        setCages(userCages);

        const firstTypeId = types.length > 0 ? types[0].ID : "";
        const initialVariants = variants.filter(
          (variant) => variant.animalType_ID === firstTypeId
        );

        const firstPlaceId = userPlaces.length > 0 ? userPlaces[0].ID : "";
        const initialCages = userCages.filter(
          (cage) => cage.place_ID === firstPlaceId
        );

        setFilteredVariants(initialVariants);
        setFilteredCages(initialCages);

        setFormData((prev) => ({
          ...prev,
          animalType_ID: firstTypeId,
          variant_ID: initialVariants.length > 0 ? initialVariants[0].ID : "",
          place_ID: firstPlaceId,
          cage_ID: initialCages.length > 0 ? initialCages[0].ID : "",
        }));
      } catch (error) {
        console.error(error);
        setMessage("Failed to load animal form data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "animalType_ID") {
      const variantsForType = animalVariants.filter(
        (variant) => variant.animalType_ID === value
      );

      setFilteredVariants(variantsForType);

      setFormData((prev) => ({
        ...prev,
        animalType_ID: value,
        variant_ID: variantsForType.length > 0 ? variantsForType[0].ID : "",
      }));

      return;
    }

    if (name === "place_ID") {
      const cagesForPlace = cages.filter((cage) => cage.place_ID === value);

      setFilteredCages(cagesForPlace);

      setFormData((prev) => ({
        ...prev,
        place_ID: value,
        cage_ID: cagesForPlace.length > 0 ? cagesForPlace[0].ID : "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (!currentUser) {
      setMessage("You must be logged in to add animals.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        owner_ID: currentUser.ID,
        animalType_ID: formData.animalType_ID,
        customName: formData.customName,
        groupNumber: formData.groupNumber,
        age: formData.age,
        sourceType: formData.sourceType,
        quantity: parseInt(formData.quantity, 10),
        notes: formData.notes,
      };

      if (formData.variant_ID) payload.variant_ID = formData.variant_ID;
      if (formData.place_ID) payload.place_ID = formData.place_ID;
      if (formData.cage_ID) payload.cage_ID = formData.cage_ID;

      await createFarmAnimal(payload);

      setMessage("Animal added successfully!");

      setTimeout(() => {
        navigate("/my-farm/animals");
      }, 1000);
    } catch (error) {
      console.error("Add animal error:", error);
      setMessage(`Failed to add animal: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm/animals")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">Add Animal</h1>
        <p className="text-gray-600 mb-6">
          Add a new animal or animal group to your farm.
        </p>

        {loading ? (
          <p className="text-green-700">Loading animal form...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Photo
              </label>

              <div className="flex flex-col items-center gap-3">
                <div className="w-full h-52 rounded-2xl overflow-hidden border border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Animal Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-green-700 text-sm">
                      No animal photo selected
                    </span>
                  )}
                </div>

                <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                  Upload Animal Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-gray-500 text-center">
                  Photo preview only for now. Backend image upload will be added later.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal Type
              </label>
              <select
                name="animalType_ID"
                value={formData.animalType_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              >
                {animalTypes.map((type) => (
                  <option key={type.ID} value={type.ID}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant
              </label>
              <select
                name="variant_ID"
                value={formData.variant_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">No variant</option>
                {filteredVariants.map((variant) => (
                  <option key={variant.ID} value={variant.ID}>
                    {variant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place
              </label>
              <select
                name="place_ID"
                value={formData.place_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">No place</option>
                {places.map((place) => (
                  <option key={place.ID} value={place.ID}>
                    {place.name} ({place.placeNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cage
              </label>
              <select
                name="cage_ID"
                value={formData.cage_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">No cage</option>
                {filteredCages.map((cage) => (
                  <option key={cage.ID} value={cage.ID}>
                    {cage.cageNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Name
              </label>
              <input
                type="text"
                name="customName"
                value={formData.customName}
                onChange={handleChange}
                placeholder="Optional custom animal name"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Number
              </label>
              <input
                type="text"
                name="groupNumber"
                value={formData.groupNumber}
                onChange={handleChange}
                placeholder="e.g. Q001"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 6 weeks"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Type
              </label>
              <select
                name="sourceType"
                value={formData.sourceType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="Hatched">Hatched</option>
                <option value="Bought">Bought</option>
                <option value="Transferred">Transferred</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows="4"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add notes about this animal group"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              ></textarea>
            </div>

            {message && (
              <p className="text-sm font-medium text-center text-green-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Animal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddAnimal;