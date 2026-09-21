import { useTranslation } from "react-i18next";

function Header({ currentUser }) {
  const { t } = useTranslation();
  const userName = currentUser ? currentUser.firstName : t("guest");

  return (
    <div className="bg-gradient-to-b from-green-100 to-[#f7f8f2] px-4 pt-6 pb-4 rounded-b-[30px] shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-green-700">
            {t("welcome")}, {userName}
          </p>
          <h1 className="text-3xl font-bold text-green-900">
            {t("appName")}
          </h1>
          <p className="text-lg text-green-700 -mt-1">
            {t("marketplace")}
          </p>
        </div>

        <div className="flex items-center gap-3 text-green-900">
          <div className="relative">
            <span className="text-2xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full px-1.5">
              3
            </span>
          </div>
          <span className="text-2xl">🔔</span>
        </div>
      </div>

      <div className="mt-5 flex items-center bg-white rounded-full shadow-sm px-4 py-3">
        <span className="text-xl mr-3">🔍</span>
        <input
          type="text"
          placeholder={t("headerSearchPlaceholder")}
          className="w-full outline-none bg-transparent text-gray-700"
        />
        <span className="text-xl ml-3">⚙️</span>
      </div>
    </div>
  );
}

export default Header;