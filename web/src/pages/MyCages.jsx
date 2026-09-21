import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { fetchCagesByOwner, deleteCage } from "../services/api";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "react-i18next";

function MyCages() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCages() {
      if (!currentUser) {
        setError(t("noLoggedUserFound"));
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCagesByOwner(currentUser.ID);
        setCages(data);
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadCages"));
      } finally {
        setLoading(false);
      }
    }

    loadCages();
  }, [currentUser, t]);

  async function handleDelete(cageId) {
    const confirmed = window.confirm(t("areYouSureDeleteCage"));
    if (!confirmed) return;

    try {
      await deleteCage(cageId);
      setCages((prev) => prev.filter((cage) => cage.ID !== cageId));
    } catch (error) {
      console.error(error);
      setError(t("failedToDeleteCage"));
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("myCages")}
        subtitle={t("manageCages")}
        backTo="/my-farm"
      />

      <div className="mb-6">
        <button
          onClick={() => navigate("/my-farm/cages/add")}
          className="w-full sm:w-auto bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          + {t("addCage")}
        </button>
      </div>

      {loading && <p className="text-green-700">{t("loadingCages")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && cages.length === 0 && (
        <p className="text-gray-600">{t("noCagesFound")}</p>
      )}

      {!loading && !error && cages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cages.map((cage) => (
            <div
              key={cage.ID}
              className="bg-white rounded-[24px] shadow-sm p-5 border border-green-50"
            >
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                {t("cage")}
              </span>

              <h2 className="text-xl font-bold text-gray-900">
                {cage.cageNumber}
              </h2>

              <p className="text-sm text-gray-600 mt-2">
                <strong>{t("place")}:</strong> {cage.place?.name || t("unknown")}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                <strong>{t("capacity")}:</strong> {cage.capacity || 0}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                <strong>{t("notes")}:</strong> {cage.notes || t("noNotes")}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/my-farm/cages/edit/${cage.ID}`, {
                      state: { cage },
                    })
                  }
                  className="flex-1 bg-green-700 text-white py-2 rounded-full text-sm font-semibold"
                >
                  {t("edit")}
                </button>

                <button
                  onClick={() => handleDelete(cage.ID)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-full text-sm font-semibold border border-red-100"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default MyCages;