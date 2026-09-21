import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchIncubatorsByOwner } from "../services/api";
import fallbackImage from "../assets/images/fallback-product.jpg";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { useTranslation } from "react-i18next";

function MyIncubators() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [incubators, setIncubators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIncubators() {
      if (!currentUser) {
        setError(t("noLoggedUserFound"));
        setLoading(false);
        return;
      }

      try {
        const data = await fetchIncubatorsByOwner(currentUser.ID);
        setIncubators(data);
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadIncubators"));
      } finally {
        setLoading(false);
      }
    }

    loadIncubators();
  }, [currentUser, t]);

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myIncubators")}
        subtitle={t("manageIncubators")}
        backTo="/my-farm"
      />

      <div className="mb-6">
        <button
          onClick={() => navigate("/my-farm/incubators/add")}
          className="w-full sm:w-auto bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + {t("addIncubator")}
        </button>
      </div>

      {loading && <p className="text-green-700">{t("loadingIncubators")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && incubators.length === 0 && (
        <p className="text-gray-600">{t("noIncubatorsFound")}</p>
      )}

      {!loading && !error && incubators.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {incubators.map((incubator) => (
            <div
              key={incubator.ID}
              className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-green-50"
            >
              <img
                src={incubator.photoUrl || fallbackImage}
                alt={incubator.name}
                className="h-52 w-full object-cover bg-green-50"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="p-4">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-2">
                  {incubator.condition || t("unknown")}
                </span>

                <h2 className="text-xl font-bold text-gray-900">
                  {incubator.name}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>{t("capacity")}:</strong> {incubator.capacity || 0} {t("eggs")}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>{t("notes")}:</strong> {incubator.notes || t("noNotes")}
                </p>

                <div className="mt-4">
                  <button
                    onClick={() =>
                      navigate(`/my-farm/incubators/${incubator.ID}/cycles`, {
                        state: { incubator },
                      })
                    }
                    className="w-full bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                  >
                    {t("viewCycles")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default MyIncubators;