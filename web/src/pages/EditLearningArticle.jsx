import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchLearningCategories,
  updateLearningArticle
} from "../services/api";
import { getCurrentUser } from "../services/auth";
import { useTranslation } from "react-i18next";

function EditLearningArticle() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const article = state?.article;
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const isAdmin = currentUser?.role === "admin";

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: article?.title || "",
    summary: article?.summary || "",
    content: article?.content || "",
    imageUrl: article?.imageUrl || "",
    category_ID: article?.category_ID || article?.category?.ID || ""
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchLearningCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setMessage(t("failedToLoadLearningCategories"));
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [t]);

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            {t("accessDenied")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("onlyAdminsCanEditArticles")}
          </p>
          <button
            onClick={() => navigate("/learning")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            {t("back")}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            {t("articleNotFound")}
          </h2>
          <button
            onClick={() => navigate("/learning")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            {t("back")}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        imageUrl: formData.imageUrl,
        category_ID: formData.category_ID
      };

      await updateLearningArticle(article.ID, payload);

      setMessage(t("articleUpdatedSuccessfully"));

      setTimeout(() => {
        navigate(`/learning/${article.ID}`, {
          state: {
            article: {
              ...article,
              ...payload,
              category:
                categories.find((cat) => cat.ID === formData.category_ID) ||
                article.category
            }
          }
        });
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToUpdateArticle")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() =>
          navigate(`/learning/${article.ID}`, {
            state: { article }
          })
        }
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("editArticle")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("editLearningArticleSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("title")}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("summary")}
            </label>
            <textarea
              rows="3"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("content")}
            </label>
            <textarea
              rows="6"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("imageUrl")}
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("category")}
            </label>
            <select
              name="category_ID"
              value={formData.category_ID}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              disabled={loadingCategories}
              required
            >
              {categories.map((category) => (
                <option key={category.ID} value={category.ID}>
                  {t(`learningCategory.${category.name}`, category.name)}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <p className="text-sm text-center text-green-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg disabled:opacity-50"
          >
            {submitting ? t("saving") : t("saveChanges")}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default EditLearningArticle;