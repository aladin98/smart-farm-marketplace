import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navItemClass = (path) =>
    `flex flex-col items-center ${
      isActive(path) ? "text-green-700 font-medium" : "text-gray-500"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <button onClick={() => navigate("/")} className={navItemClass("/")}>
        <span>🏠</span>
        <span className="text-xs mt-1">{t("home")}</span>
      </button>

      <button
        onClick={() => navigate("/my-farm")}
        className={navItemClass("/my-farm")}
      >
        <span>🌾</span>
        <span className="text-xs mt-1">{t("myFarm")}</span>
      </button>

      <button
        onClick={() => navigate("/sell")}
        className="bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl -mt-8 shadow-lg"
        aria-label={t("sellProduct")}
        title={t("sellProduct")}
      >
        +
      </button>

      <button
        onClick={() => navigate("/learning")}
        className={navItemClass("/learning")}
      >
        <span>📘</span>
        <span className="text-xs mt-1">{t("learning")}</span>
      </button>

      <button
        onClick={() => navigate("/profile")}
        className={navItemClass("/profile")}
      >
        <span>👤</span>
        <span className="text-xs mt-1">{t("profile")}</span>
      </button>
    </div>
  );
}

export default BottomNav;