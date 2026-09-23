import BottomNav from "../components/BottomNav";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import fallbackImage from "../assets/images/fallback-product.jpg";
import { useTranslation } from "react-i18next";
import { isAdmin } from "../services/auth";
import { deleteLearningArticle } from "../services/api";
import { getEntityFromStateOrCache } from "../utils/getEntityFromStateOrCache";

function LearningArticleDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const { t } = useTranslation();
  const canManageLearning = isAdmin();

  const article = getEntityFromStateOrCache({
    state,
    stateKey: "article",
    id,
    moduleName: "learning",
    userId: "global",
  });

  async function handleDelete() {
    if (!article) return;

    const confirmed = window.confirm(t("areYouSureDeleteArticle"));
    if (!confirmed) return;

    try {
      await deleteLearningArticle(article.ID);
      navigate("/learning");
    } catch (error) {
      console.error(error);
      alert(`${t("failedToDeleteArticle")}: ${error.message}`);
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white p-6 rounded-[28px] shadow-sm text-center">
          <p className="text-xl font-semibold text-green-900">
            {t("articleNotFound")}
          </p>
          <button
            onClick={() => navigate("/learning")}
            className="mt-4 bg-green-700 text-white px-5 py-3 rounded-full"
          >
            {t("back")}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/learning")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] shadow-sm overflow-hidden max-w-4xl mx-auto">
        <img
          src={article.imageUrl || fallbackImage}
          alt={article.title}
          className="w-full h-72 object-cover bg-green-50"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />

        <div className="p-6">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
            {article.category?.name
              ? t(
                  `learningCategory.${article.category.name}`,
                  article.category.name
                )
              : t("learning")}
          </span>

          <h1 className="text-3xl font-bold text-green-950 mb-4">
            {article.title}
          </h1>

          <p className="text-gray-600 leading-7 whitespace-pre-line">
            {article.content}
          </p>

          {canManageLearning && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  navigate(`/learning/edit/${article.ID}`, {
                    state: { article },
                  })
                }
                className="w-full sm:w-auto bg-green-700 text-white py-3 px-6 rounded-full font-semibold"
              >
                {t("editArticle")}
              </button>

              <button
                onClick={handleDelete}
                className="w-full sm:w-auto bg-red-50 text-red-600 py-3 px-6 rounded-full font-semibold border border-red-100"
              >
                {t("deleteArticle")}
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default LearningArticleDetails;