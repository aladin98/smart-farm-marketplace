import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchPlacesByOwner,
  fetchCagesByOwner,
  updateFarmAnimal,
} from "../services/api";
import { getCurrentUser } from "../services/auth";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";

function EditAnimal() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const animal = state?.animal;
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [places, setPlaces] = useState([]);
  const [cages, setCages] = useState([]);
  const [filteredCages, setFilteredCages] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(animal?.photoUrl || "");

  const [formData, setFormData] = useState({
    place_ID: animal?.place_ID || "",
    cage_ID: animal?.cage_ID || "",
    customName: animal?.customName || "",
    groupNumber: animal?.groupNumber || "",
    age: animal?.age || "",
    sourceType: animal?.sourceType || "Hatched",
    quantity: animal?.quantity || "",
    notes: animal?.notes || "",
    photoUrl: animal?.photoUrl || "",
  });

  useEffect(() => {
    async function loadData() {
      if (!currentUser || !animal) {
        setLoading(false);
        return;
      }

      try {
        const [userPlaces, userCages] = await Promise.all([
          fetchPlacesByOwner(currentUser.ID),
          fetchCagesByOwner(currentUser.ID),
        ]);

        setPlaces(userPlaces);
        setCages(userCages);

        const cagesForPlace = userCages.filter(
          (cage) => cage.place_ID === (animal?.place_ID || "")
        );

        setFilteredCages(cagesForPlace);
      } catch (error) {
        console.error(error);
        setMessage(t("failedToLoadAnimalEditData"));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser, animal, t]);

  if (!animal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            {t("animalNotFound")}
          </h2>
          <button
            onClick={() => navigate("/my-farm/animals")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            {t("backToAnimals")}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;

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

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedPhoto = await resizeImage(file, 1000, 700, 0.8);

      setPhotoPreview(resizedPhoto);
      setFormData((prev) => ({
        ...prev,
        photoUrl: resizedPhoto,
      }));
    } catch (error) {
      console.error(error);
      setMessage(t("failedToProcessImage"));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        customName: formData.customName,
        groupNumber: formData.groupNumber,
        age: formData.age,
        sourceType: formData.sourceType,
        quantity: parseInt(formData.quantity, 10),
        notes: formData.notes,
        photoUrl: formData.photoUrl,
      };

      if (formData.place_ID) payload.place_ID = formData.place_ID;
      if (formData.cage_ID) payload.cage_ID = formData.cage_ID;

      await updateFarmAnimal(animal.ID, payload);

      setMessage(t("animalUpdatedSuccessfully"));

      setTimeout(() => {
        navigate("/my-farm/animals");
      }, 1000);
    } catch (error) {
      console.error("Edit animal error:", error);
      setMessage(`${t("failedToUpdateAnimal")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/my-farm/animals")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("editAnimal")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("updateAnimalDetailsSubtitle")}
        </p>

        {loading ? (
          <p className="text-green-700">{t("loadingAnimalData")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("animalPhoto")}
              </label>

              <div className="flex flex-col items-center gap-3">
                <div className="w-full h-52 rounded-2xl overflow-hidden border border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={t("animalPreview")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-green-700 text-sm">
                      {t("noAnimalPhotoSelected")}
                    </span>
                  )}
                </div>

                <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                  {t("changePhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-gray-500 text-center">
                  {t("animalPhotoUpdateNote")}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("place")}
              </label>
              <select
                name="place_ID"
                value={formData.place_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">{t("noPlace")}</option>
                {places.map((place) => (
                  <option key={place.ID} value={place.ID}>
                    {place.name} ({place.placeNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("cage")}
              </label>
              <select
                name="cage_ID"
                value={formData.cage_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">{t("noCage")}</option>
                {filteredCages.map((cage) => (
                  <option key={cage.ID} value={cage.ID}>
                    {cage.cageNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("customName")}
              </label>
              <input
                type="text"
                name="customName"
                value={formData.customName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("groupNumber")}
              </label>
              <input
                type="text"
                name="groupNumber"
                value={formData.groupNumber}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("age")}
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("sourceType")}
              </label>
              <select
                name="sourceType"
                value={formData.sourceType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="Hatched">{t("hatched")}</option>
                <option value="Bought">{t("bought")}</option>
                <option value="Transferred">{t("transferred")}</option>
                <option value="Other">{t("other")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("quantity")}
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("notes")}
              </label>
              <textarea
                rows="4"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              />
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
              {submitting ? t("saving") : t("saveChanges")}
            </button>
          </form>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default EditAnimal;