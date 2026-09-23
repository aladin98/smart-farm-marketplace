import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, fetchCategories } from "../services/api";
import { getCurrentUser } from "../services/auth";
import BottomNav from "../components/BottomNav";
import { useTranslation } from "react-i18next";
import { resizeImage } from "../utils/image";

function SellProduct() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category_ID: "",
    age: "",
    description: "",
    price: "",
    phoneNumber: currentUser?.phoneNumber || "",
    city: currentUser?.city || "",
    deliveryAvailable: false,
    photoUrl: "",
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category_ID: data[0].ID,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedPhoto = await resizeImage(file, 1000, 700, 0.8);

      setPhotoPreview(resizedPhoto);
      setFormData((prev) => ({
        ...prev,
        photoUrl: resizedPhoto,
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

    if (!currentUser) {
      setMessage(t("mustBeLoggedInToPublish"));
      setSubmitting(false);
      return;
    }

    const parsedPrice = parseFloat(formData.price);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setMessage(t("invalidPrice"));
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        age: formData.age,
        description: formData.description,
        photoUrl: formData.photoUrl,
        deliveryAvailable: formData.deliveryAvailable,
        condition: "New",
        isNegotiable: false,
        price: parsedPrice,
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        status: "Available",
        seller_ID: currentUser.ID,
        country_ID: currentUser.country_ID,
        category_ID: formData.category_ID,
      };

      await createProduct(payload);

      setMessage(t("productPublishedSuccess"));

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`${t("productPublishFailed")}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-green-800 font-medium"
      >
        ← {t("back")}
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          {t("sellProduct")}
        </h1>
        <p className="text-gray-600 mb-2">{t("sellProductSubtitle")}</p>

        {currentUser && (
          <p className="text-sm text-green-700 mb-6">
            {t("sellingAs")}:{" "}
            <strong>
              {currentUser.firstName} {currentUser.lastName}
            </strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("productPhoto")}
            </label>

            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-52 rounded-2xl overflow-hidden border border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={t("productPhoto")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green-700 text-sm">
                    {t("noProductPhotoSelected")}
                  </span>
                )}
              </div>

              <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                {t("uploadProductPhoto")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("productName")}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("enterProductName")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
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
              required
              disabled={loadingCategories}
            >
              {categories.map((category) => (
                <option key={category.ID} value={category.ID}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("age")}
            </label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder={t("enterProductAge")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("description")}
            </label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("describeYourProduct")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("price")}
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder={t("enterPrice")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
              min="0.01"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("phoneNumber")}
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder={t("enterPhoneNumber")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("city")}
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder={t("enterCity")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              {t("deliveryAvailable")}
            </span>
            <input
              type="checkbox"
              name="deliveryAvailable"
              checked={formData.deliveryAvailable}
              onChange={handleChange}
              className="w-5 h-5 accent-green-700"
            />
          </div>

          {message && (
            <p className="text-sm font-medium text-center text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg mt-4 disabled:opacity-50"
          >
            {submitting ? t("publishing") : t("publishProduct")}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default SellProduct;