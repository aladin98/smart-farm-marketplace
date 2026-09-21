import LanguageSwitcher from "../components/LanguageSwitcher";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../services/api";
import { useTranslation } from "react-i18next";
import { loginUser } from "../services/auth";
import { authenticateUser } from "../services/auth";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleLogin(e) {
  e.preventDefault();
  setSubmitting(true);
  setMessage("");

  try {
    const matchedUser = await authenticateUser(
      formData.email,
      formData.password
    );

    if (!matchedUser) {
      setMessage(t("invalidEmailOrPassword"));
      return;
    }

    setMessage(t("loginSuccess"));

    setTimeout(() => {
      navigate("/");
    }, 800);
  } catch (error) {
    console.error(error);
    setMessage(t("loginFailed"));
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
            <h1 className="text-4xl font-bold text-green-900">{t("appName")}</h1>
            <p className="text-lg text-green-700">{t("marketplace")}</p>
            <p className="text-gray-500 mt-3">
              {t("welcomeBackLogin")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("password")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("enterYourPassword")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-green-700 font-medium"
              >
                {t("forgotPassword")}
              </button>
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
              {submitting ? t("loggingIn") : t("login")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("dontHaveAccount")}{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-green-700 font-semibold"
              >
                {t("createAccount")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;