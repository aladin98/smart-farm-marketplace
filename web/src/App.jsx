import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import ProductCard from "./components/ProductCard";
import BottomNav from "./components/BottomNav";
import { categories } from "./data/products";
import { fetchProductsByCountry } from "./services/api";
import ProductDetails from "./pages/ProductDetails";
import SellProduct from "./pages/SellProduct";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getCurrentUser } from "./services/auth";

function MarketplaceHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = getCurrentUser();

  useEffect(() => {
    async function loadProducts() {
      try {
        if (!currentUser?.country_ID) {
          setError("No logged user country found.");
          setLoading(false);
          return;
        }

        const data = await fetchProductsByCountry(currentUser.country_ID);
        setProducts(data);
      } catch (err) {
        console.error("Fetch products error:", err);
        setError(`Could not load products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [currentUser]);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="min-h-screen bg-[#f7f8f2] text-gray-900">
      <Header currentUser={currentUser} />

      <CategoryChips
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="px-4 mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-950">Featured Listings</h2>
          <p className="text-sm text-green-700">
            {currentUser?.country?.name
              ? `Products from ${currentUser.country.name}`
              : "Fresh from trusted farms"}
          </p>
        </div>
        <button className="text-green-800 font-medium">View all</button>
      </div>

      <div className="px-4 mt-4 pb-28">
        {loading && <p className="text-green-700">Loading products...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.ID} product={product} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketplaceHome />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/sell" element={<SellProduct />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;