import { useState } from "react";
import { useNavigate } from "react-router-dom";
import fallbackImage from "../assets/images/fallback-product.jpg";

function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(product.photoUrl || fallbackImage);
  const navigate = useNavigate();

  const categoryName = product.category?.name || "Uncategorized";
  const sellerName = product.seller
    ? `${product.seller.firstName} ${product.seller.lastName}`
    : "Unknown seller";

  return (
    <div
      onClick={() => navigate(`/product/${product.ID}`, { state: { product } })}
      className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-green-50 cursor-pointer"
    >
      <img
        src={imgSrc}
        alt={product.name}
        className="h-52 w-full object-cover bg-green-50"
        onError={() => setImgSrc(fallbackImage)}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-2">
              {categoryName}
            </span>
            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
              {product.name}
            </h3>
          </div>

          <button
            className="text-xl"
            onClick={(e) => e.stopPropagation()}
          >
            🤍
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-1">{product.age}</p>
        <p className="text-sm text-gray-600 mt-1">{product.description}</p>

        <p className="text-2xl font-bold text-green-700 mt-3">
          {product.price} MAD
        </p>

        <p className="text-sm text-gray-500 mt-2">📍 {product.city}</p>
        <p className="text-sm text-gray-500 mt-1">👤 {sellerName}</p>

        <div className="mt-3">
          <span className="inline-block bg-green-50 text-green-700 text-sm rounded-full px-3 py-1">
            {product.deliveryAvailable ? "Delivery available" : "No delivery"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;