import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser, isOwner } from "../services/auth";
import fallbackImage from "../assets/images/fallback-product.jpg";
import BottomNav from "../components/BottomNav";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Profile() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const owner = isOwner();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <LanguageSwitcher />
          </div>

          <div className="bg-white rounded-[28px] shadow-sm p-6 text-center w-full">
            <h2 className="text-2xl font-bold text-green-900 mb-3">
              {t("notLoggedIn")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("pleaseLoginToAccessProfile")}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
            >
              {t("goToLogin")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="mb-4 max-w-2xl mx-auto">
        <LanguageSwitcher />
      </div>

      <div className="bg-white rounded-[28px] shadow-sm p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <img
            src={currentUser.profilePhoto || fallbackImage}
            alt={`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()}
            className="w-28 h-28 rounded-full object-cover border-4 border-green-100 shadow-sm"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />

          <h1 className="text-3xl font-bold text-green-950 mt-4">
            {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="text-gray-500 mt-1">{currentUser.email}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">{t("phoneNumber")}</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.phoneNumber || t("notAvailable")}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">{t("idCardNumber")}</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.idCardNumber || t("notAvailable")}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">{t("city")}</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.city || t("notAvailable")}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">{t("country")}</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.country?.name || t("notAvailable")}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate("/profile/edit")}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold"
          >
            {t("editProfile")}
          </button>

          {owner && (
            <button
              onClick={() => navigate("/admin/users")}
              className="w-full bg-green-50 text-green-700 py-3 rounded-full font-semibold border border-green-100"
            >
              {t("manageUsers")}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 py-3 rounded-full font-semibold border border-red-100"
          >
            {t("logout")}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default Profile;