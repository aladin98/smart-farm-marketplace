import LanguageSwitcher from "../components/LanguageSwitcher";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetPasswordRequest } from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage(t("passwordsDoNotMatch"));
      setIsError(true);
      return;
    }

    setSubmitting(true);

    try {
      await resetPasswordRequest(formData.email, formData.newPassword);
      setMessage(t("passwordResetSuccess"));
      setIsError(false);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessage(t("passwordResetFailed"));
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-[28px] shadow-sm p-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-green-900">
              {t("forgotPassword")}
            </h1>
            <p className="text-gray-500 mt-3">{t("resetYourPassword")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("enterYourEmail")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t("newPassword")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="text-sm text-green-700 font-medium"
                >
                  {showNewPassword ? t("hide") : t("show")}
                </button>
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={t("enterNewPassword")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t("confirmPassword")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-sm text-green-700 font-medium"
                >
                  {showConfirmPassword ? t("hide") : t("show")}
                </button>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("confirmYourPassword")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            {message && (
              <p
                className={`text-sm font-medium text-center ${
                  isError ? "text-red-600" : "text-green-700"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg disabled:opacity-50"
            >
              {submitting ? t("saving") : t("resetPassword")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-green-700 font-semibold"
            >
              {t("backToLogin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;