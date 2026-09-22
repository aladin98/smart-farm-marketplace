import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchLearningCategories,
  fetchLearningArticles,
} from "../services/api";
import { getCurrentUser, isAdmin } from "../services/auth";
import fallbackImage from "../assets/images/fallback-product.jpg";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";

function Learning() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const canManageLearning = isAdmin();

  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLearning() {
      try {
        const [cats, arts] = await Promise.all([
          fetchLearningCategories(),
          fetchLearningArticles(),
        ]);

        setCategories(cats);
        setArticles(arts);
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadLearningContent"));
      } finally {
        setLoading(false);
      }
    }

    loadLearning();
  }, [t]);

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter(
          (article) =>
            article.category?.name?.toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("learningAboutFarming")}
        subtitle={t("improveKnowledgeWithGuides")}
        backTo="/"
      />

      {canManageLearning && (
        <div className="mb-6">
          <button
            onClick={() => navigate("/learning/add")}
            className="w-full sm:w-auto bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
          >
            + {t("addArticle")}
          </button>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm border ${
            selectedCategory === "All"
              ? "bg-green-700 text-white border-green-700"
              : "bg-white text-gray-700 border-gray-200"
          }`}
        >
          {t("all")}
        </button>

        {categories.map((category) => (
          <button
            key={category.ID}
            onClick={() => setSelectedCategory(category.name)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm border ${
              selectedCategory === category.name
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            {t(`learningCategory.${category.name}`, category.name)}
          </button>
        ))}
      </div>

      {loading && <p className="text-green-700">{t("loadingLearningContent")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && filteredArticles.length === 0 && (
        <p className="text-gray-600">{t("noArticlesFound")}</p>
      )}

      {!loading && !error && filteredArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredArticles.map((article) => (
            <div
              key={article.ID}
              onClick={() =>
                navigate(`/learning/${article.ID}`, { state: { article } })
              }
              className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-green-50 cursor-pointer"
            >
              <img
                src={article.imageUrl || fallbackImage}
                alt={article.title}
                className="h-52 w-full object-cover bg-green-50"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="p-4">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-2">
                  {article.category?.name
                    ? t(`learningCategory.${article.category.name}`, article.category.name)
                    : t("learning")}
                </span>

                <h2 className="text-xl font-bold text-gray-900">
                  {article.title}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  {article.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default Learning;