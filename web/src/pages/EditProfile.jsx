import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCountries, updateProfile } from "../services/api";
import { getCurrentUser, setCurrentUser } from "../services/auth";
import { useTranslation } from "react-i18next";

function EditProfile() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(currentUser?.profilePhoto || "");

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    phoneNumber: currentUser?.phoneNumber || "",
    idCardNumber: currentUser?.idCardNumber || "",
    city: currentUser?.city || "",
    country_ID: currentUser?.country_ID || "",
    profilePhoto: currentUser?.profilePhoto || "",
  });

  useEffect(() => {
    async function loadCountries() {
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (error) {
        console.error(error);
        setMessage(t("failedToLoadCountries"));
      } finally {
        setLoadingCountries(false);
      }
    }

    loadCountries();
  }, [t]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white p-6 rounded-[28px] shadow-sm text-center max-w-md w-full">
          <p className="text-xl font-semibold text-green-900">
            {t("noUserFound")}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-green-700 text-white px-5 py-3 rounded-full"
          >
            {t("login")}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
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
      setFormData((prev) => ({
        ...prev,
        profilePhoto: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        idCardNumber: formData.idCardNumber,
        city: formData.city,
        country_ID: formData.country_ID,
        profilePhoto: formData.profilePhoto,
      };

      await updateProfile(currentUser.ID, payload);

      const updatedUser = {
        ...currentUser,
        ...payload,
        country:
          countries.find((c) => c.ID === formData.country_ID) ||
          currentUser.country,
      };

      setCurrentUser(updatedUser);

      setMessage(t("profileUpdatedSuccessfully"));

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToUpdateProfile")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/profile")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("editProfile")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("updatePersonalInformation")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 border-4 border-white shadow-sm flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={t("profilePreview")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-green-700">👤</span>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("firstName")}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("lastName")}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("phoneNumber")}
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("idCardNumber")}
            </label>
            <input
              type="text"
              name="idCardNumber"
              value={formData.idCardNumber}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("city")}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("country")}
              </label>
              <select
                name="country_ID"
                value={formData.country_ID}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                disabled={loadingCountries}
                required
              >
                {countries.map((country) => (
                  <option key={country.ID} value={country.ID}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <p className="text-sm text-center text-green-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold"
          >
            {submitting ? t("saving") : t("saveChanges")}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default EditProfile;