import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLearningCategories } from "../services/api";
import { getCurrentUser, isAdmin } from "../services/auth";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";
import fallbackImage from "../assets/images/fallback-product.jpg";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { addOfflineCreate } from "../utils/offlineSync";
import { offlineModules } from "../utils/offlineModules";

const LEARNING_CATEGORIES_CACHE_KEY = "learningCategoriesCache";
const MODULE_NAME = "learning";
const GLOBAL_SCOPE = "global";

function AddLearningArticle() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  const canManageLearning = isAdmin();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    imageUrl: "",
    category_ID: "",
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        if (!isOnline) {
          const cachedCategories = JSON.parse(
            localStorage.getItem(LEARNING_CATEGORIES_CACHE_KEY) || "[]"
          );

          setCategories(cachedCategories);

          if (cachedCategories.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category_ID: prev.category_ID || cachedCategories[0].ID,
            }));
          }

          if (cachedCategories.length === 0) {
            setMessage(t("noOfflineLearningCategories"));
          }

          return;
        }

        const data = await fetchLearningCategories();
        setCategories(data);

        localStorage.setItem(
          LEARNING_CATEGORIES_CACHE_KEY,
          JSON.stringify(data)
        );

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category_ID: data[0].ID,
          }));
        }
      } catch (error) {
        console.error(error);

        try {
          const cachedCategories = JSON.parse(
            localStorage.getItem(LEARNING_CATEGORIES_CACHE_KEY) || "[]"
          );

          setCategories(cachedCategories);

          if (cachedCategories.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category_ID: prev.category_ID || cachedCategories[0].ID,
            }));
          } else {
            setMessage(t("failedToLoadLearningCategories"));
          }
        } catch {
          setMessage(t("failedToLoadLearningCategories"));
        }
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [t, isOnline]);

  if (!currentUser || !canManageLearning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            {t("accessDenied")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("onlyAuthorizedUsersCanAddArticles")}
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

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "imageUrl") {
      setImagePreview(value);
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedImage = await resizeImage(file, 800, 500, 0.8);

      setImagePreview(resizedImage);
      setFormData((prev) => ({
        ...prev,
        imageUrl: resizedImage,
      }));
    } catch (error) {
      console.error(error);
      setMessage(t("failedToProcessImage"));
    }
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
        category_ID: formData.category_ID,
      };

      const config = offlineModules[MODULE_NAME];

      if (!isOnline) {
        const selectedCategory =
          categories.find((category) => category.ID === formData.category_ID) ||
          null;

        addOfflineCreate(MODULE_NAME, GLOBAL_SCOPE, {
          ...payload,
          category: selectedCategory,
        });

        setMessage(t("articleSavedOffline"));

        setTimeout(() => {
          navigate("/learning");
        }, 1000);

        return;
      }

      await config.createFn(payload);

      setMessage(t("articleAddedSuccessfully"));

      setTimeout(() => {
        navigate("/learning");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToAddArticle")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/learning")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      {!isOnline && (
        <div className="bg-white rounded-[24px] p-4 text-center shadow-sm border border-orange-100 mb-6 max-w-2xl mx-auto">
          <p className="text-orange-700 font-semibold">
            {t("offlineLearningMode")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("newArticlesWillBeSavedOffline")}
          </p>
        </div>
      )}

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("addArticle")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("addLearningArticleSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <img
              src={imagePreview || fallbackImage}
              alt={t("articlePreview")}
              className="w-full max-w-md h-52 object-cover rounded-2xl border border-green-100 bg-green-50"
              onError={(e) => {
                e.currentTarget.src = fallbackImage;
              }}
            />

            <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
              {t("uploadPhoto")}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("title")}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t("enterArticleTitle")}
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
              placeholder={t("enterArticleSummary")}
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
              placeholder={t("enterArticleContent")}
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
              value={
                formData.imageUrl.startsWith("data:image") ? "" : formData.imageUrl
              }
              onChange={handleChange}
              placeholder={t("enterImageUrl")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
            <p className="text-xs text-gray-500 mt-1">{t("orUploadImage")}</p>
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
            disabled={submitting || loadingCategories}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg disabled:opacity-50"
          >
            {submitting ? t("adding") : t("addArticle")}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default AddLearningArticle;