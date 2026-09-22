import BottomNav from "../components/BottomNav";
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
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";

const getAnimalsCacheKey = (userId) => `myFarmAnimalsCache_${userId}`;
const getAnimalsPendingKey = (userId) => `myFarmAnimalsPending_${userId}`;

function AddAnimal() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

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
    photoUrl: "",
  });

  useEffect(() => {
    async function loadData() {
      if (!currentUser) {
        setMessage(t("noLoggedUserFound"));
        setLoading(false);
        return;
      }

      if (!navigator.onLine) {
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
        setMessage(t("failedToLoadAnimalFormData"));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser, t]);

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

    if (!currentUser) {
      setMessage(t("mustBeLoggedInToAddAnimals"));
      setSubmitting(false);
      return;
    }

    const payload = {
      owner_ID: currentUser.ID,
      animalType_ID: formData.animalType_ID,
      customName: formData.customName,
      groupNumber: formData.groupNumber,
      age: formData.age,
      sourceType: formData.sourceType,
      quantity: parseInt(formData.quantity, 10),
      notes: formData.notes,
      photoUrl: formData.photoUrl,
      syncAction: "create",
    };

    if (formData.variant_ID) payload.variant_ID = formData.variant_ID;
    if (formData.place_ID) payload.place_ID = formData.place_ID;
    if (formData.cage_ID) payload.cage_ID = formData.cage_ID;

    try {
      if (!navigator.onLine) {
        const cacheKey = getAnimalsCacheKey(currentUser.ID);
        const pendingKey = getAnimalsPendingKey(currentUser.ID);

        const cachedAnimals = JSON.parse(localStorage.getItem(cacheKey) || "[]");
        const pendingAnimals = JSON.parse(localStorage.getItem(pendingKey) || "[]");

        const offlineAnimal = {
          ID: `offline-${Date.now()}`,
          ...payload,
          pendingSync: true,
          animalType:
            animalTypes.find((type) => type.ID === formData.animalType_ID) || null,
          variant:
            animalVariants.find((variant) => variant.ID === formData.variant_ID) || null,
          place:
            places.find((place) => place.ID === formData.place_ID) || null,
          cage:
            cages.find((cage) => cage.ID === formData.cage_ID) || null,
        };

        const updatedCache = [offlineAnimal, ...cachedAnimals];
        const updatedPending = [offlineAnimal, ...pendingAnimals];

        localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
        localStorage.setItem(pendingKey, JSON.stringify(updatedPending));

        setMessage(t("animalSavedOffline"));

        setTimeout(() => {
          navigate("/my-farm/animals");
        }, 1000);

        return;
      }

      await createFarmAnimal(payload);

      setMessage(t("animalAddedSuccessfully"));

      setTimeout(() => {
        navigate("/my-farm/animals");
      }, 1000);
    } catch (error) {
      console.error("Add animal error:", error);
      setMessage(`${t("failedToAddAnimal")}: ${error.message}`);
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

      {!navigator.onLine && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6 max-w-2xl mx-auto">
          <p className="text-orange-700 font-semibold">
            {t("offlineAnimalsMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("newAnimalsWillBeSavedOffline")}
          </p>
        </div>
      )}

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("addAnimal")}
        </h1>
        <p className="text-gray-600 mb-6">{t("addNewAnimalSubtitle")}</p>

        {loading ? (
          <p className="text-green-700">{t("loadingAnimalForm")}</p>
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
                  {t("uploadAnimalPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-gray-500 text-center">
                  {t("animalPhotoPreviewNote")}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("animalType")}
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
                {t("variant")}
              </label>
              <select
                name="variant_ID"
                value={formData.variant_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">{t("noVariant")}</option>
                {filteredVariants.map((variant) => (
                  <option key={variant.ID} value={variant.ID}>
                    {variant.name}
                  </option>
                ))}
              </select>
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
                placeholder={t("optionalCustomAnimalName")}
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
                placeholder={t("groupNumberExample")}
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
                placeholder={t("animalAgeExample")}
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
                placeholder={t("enterQuantity")}
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
                placeholder={t("animalNotesPlaceholder")}
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
              {submitting ? t("adding") : t("addAnimal")}
            </button>
          </form>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default AddAnimal;