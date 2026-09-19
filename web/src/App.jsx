import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import ProductCard from "./components/ProductCard";
import BottomNav from "./components/BottomNav";
import { categories } from "./data/products";
import { fetchProducts } from "./services/api";
import SellProduct from "./pages/SellProduct";
import ProductDetails from "./pages/ProductDetails";

function MarketplaceHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Fetch products error:", err);
        setError(`Could not load products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="min-h-screen bg-[#f7f8f2] text-gray-900">
      <Header />

      <CategoryChips
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="px-4 mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-950">Featured Listings</h2>
          <p className="text-sm text-green-700">Fresh from trusted farms</p>
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
    </Routes>
  );
}

export default App;