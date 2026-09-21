import { useLocation, useNavigate } from "react-router-dom";
import fallbackImage from "../assets/images/fallback-product.jpg";
import { getCurrencyByCountry } from "../utils/currency";
import BottomNav from "../components/BottomNav";
import { useTranslation } from "react-i18next";

function ProductDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const product = state?.product;
  const currency = getCurrencyByCountry(product?.country?.name);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="text-center">
          <p className="text-lg text-gray-700">{t("productNotFound")}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-green-700 text-white px-5 py-2 rounded-full"
          >
            {t("backToMarketplace")}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  const sellerName = product.seller
    ? `${product.seller.firstName} ${product.seller.lastName}`
    : t("unknownSeller");

  return (
    <div className="min-h-screen bg-[#f7f8f2] pb-24">
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-green-800 font-medium"
        >
          ← {t("back")}
        </button>

        <div className="bg-white rounded-[28px] overflow-hidden shadow-sm">
          <img
            src={product.photoUrl || fallbackImage}
            alt={product.name}
            className="w-full h-72 object-cover"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />

          <div className="p-5">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
              {product.category?.name || t("uncategorized")}
            </span>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-green-700 text-3xl font-bold mt-3">
              {product.price} {currency}
            </p>

            <div className="mt-4 space-y-2 text-gray-600">
              <p><strong>{t("age")}:</strong> {product.age}</p>
              <p><strong>{t("city")}:</strong> {product.city}</p>
              <p><strong>{t("country")}:</strong> {product.country?.name || t("notAvailable")}</p>
              <p>
                <strong>{t("delivery")}:</strong>{" "}
                {product.deliveryAvailable ? t("available") : t("no")}
              </p>
              <p>
                <strong>{t("condition")}:</strong>{" "}
                {product.condition || t("notAvailable")}
              </p>
            </div>

            <div className="mt-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t("description")}
              </h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mt-6 bg-green-50 rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t("sellerInformation")}
              </h2>

              <div className="flex items-center gap-3">
                <img
                  src={product.seller?.profilePhoto || fallbackImage}
                  alt={sellerName}
                  className="w-14 h-14 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />
                <div>
                  <p className="font-semibold text-gray-900">{sellerName}</p>
                  <p className="text-sm text-gray-600">
                    {product.phoneNumber || product.seller?.phoneNumber || t("notAvailable")}
                  </p>
                </div>
              </div>

              <button className="mt-4 w-full bg-green-700 text-white py-3 rounded-full font-medium">
                {t("contactSeller")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default ProductDetails;