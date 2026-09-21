import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCountries, createUser } from "../services/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [photoPreview, setPhotoPreview] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    idCardNumber: "",
    city: "",
    country_ID: "",
    password: "",
    confirmPassword: "",
    profilePhoto: "",
  });

  useEffect(() => {
    async function loadCountries() {
      try {
        const data = await fetchCountries();
        setCountries(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            country_ID: data[0].ID,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCountries(false);
      }
    }

    loadCountries();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      setFormData((prev) => ({
        ...prev,
        profilePhoto: previewUrl,
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage(t("passwordsDoNotMatch"));
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        passwordHash: formData.password,
        phoneNumber: formData.phoneNumber,
        idCardNumber: formData.idCardNumber,
        city: formData.city,
        country_ID: formData.country_ID,
        profilePhoto: formData.profilePhoto,
      };

      await createUser(payload);

      setMessage(t("accountCreatedSuccessfully"));

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(t("failedToCreateAccount"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="mb-4">
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-[28px] shadow-sm p-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-green-900">
              {t("createAccount")}
            </h1>
            <p className="text-gray-500 mt-2">
              {t("joinSmartFarmToday")}
            </p>
          </div>

          <div className="flex flex-col items-center mb-6">
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

            <label className="mt-3 inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
              {t("uploadPhoto")}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder={t("firstName")}
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
                  placeholder={t("lastName")}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("emailAddress")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
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
                placeholder={t("phoneNumber")}
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
                placeholder={t("idCardNumber")}
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
                  placeholder={t("city")}
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
                  required
                  disabled={loadingCountries}
                >
                  {countries.map((country) => (
                    <option key={country.ID} value={country.ID}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("password")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("password")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("confirmPassword")}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("confirmPassword")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
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
              {submitting ? t("creating") : t("createAccount")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-green-700 font-semibold"
              >
                {t("login")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;