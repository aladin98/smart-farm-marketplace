import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function PageHeader({ title, subtitle, backTo = "/", backLabel }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(backTo)}
        className="mb-4 text-green-800 font-medium"
      >
        ← {backLabel || t("back")}
      </button>

      <h1 className="text-3xl font-bold text-green-950">{title}</h1>

      {subtitle && (
        <p className="text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export default PageHeader;