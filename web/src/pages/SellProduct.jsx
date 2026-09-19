import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, fetchCategories } from "../services/api";
import { getCurrentUser } from "../services/auth";

function SellProduct() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

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

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setPhotoPreview(base64String);

      setFormData((prev) => ({
        ...prev,
        photoUrl: base64String,
      }));
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (!currentUser) {
      setMessage("You must be logged in to publish a product.");
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
        price: parseFloat(formData.price),
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        status: "Available",
        seller_ID: currentUser.ID,
        country_ID: currentUser.country_ID,
        category_ID: formData.category_ID,
      };

      await createProduct(payload);

      setMessage("Product published successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Failed to publish product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <h1 className="text-3xl font-bold text-green-950 mb-2">Sell Product</h1>
        <p className="text-gray-600 mb-2">
          Add your product details to publish it in the marketplace.
        </p>

        {currentUser && (
          <p className="text-sm text-green-700 mb-6">
            Selling as: <strong>{currentUser.firstName} {currentUser.lastName}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Photo
            </label>

            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-52 rounded-2xl overflow-hidden border border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green-700 text-sm">
                    No product photo selected
                  </span>
                )}
              </div>

              <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                Upload Product Photo
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
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
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
              Age
            </label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 6 weeks, 1 year"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              Delivery Available
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
            {submitting ? "Publishing..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SellProduct;