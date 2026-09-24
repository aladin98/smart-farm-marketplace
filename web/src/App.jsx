import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import ProductCard from "./components/ProductCard";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AddLearningArticle from "./pages/AddLearningArticle";
import { categories } from "./data/products";
import { fetchProductsByCountry } from "./services/api";
import EditLearningArticle from "./pages/EditLearningArticle";
import UserManagement from "./pages/UserManagement";
import { getCurrentUser, refreshCurrentUser } from "./services/auth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import SellProduct from "./pages/SellProduct";

import MyFarm from "./pages/MyFarm";
import MyAnimals from "./pages/MyAnimals";
import AddAnimal from "./pages/AddAnimal";
import EditAnimal from "./pages/EditAnimal";

import MyIncubators from "./pages/MyIncubators";
import AddIncubator from "./pages/AddIncubator";
import EditIncubator from "./pages/EditIncubator";
import IncubationCycles from "./pages/IncubationCycles";
import AddIncubationCycle from "./pages/AddIncubationCycle";
import EditIncubationCycle from "./pages/EditIncubationCycle";

import MyPlaces from "./pages/MyPlaces";
import AddPlace from "./pages/AddPlace";
import EditPlace from "./pages/EditPlace";

import MyCages from "./pages/MyCages";
import AddCage from "./pages/AddCage";
import EditCage from "./pages/EditCage";

import MyEquipments from "./pages/MyEquipments";
import AddEquipment from "./pages/AddEquipment";
import EditEquipment from "./pages/EditEquipment";

import EditProfile from "./pages/EditProfile";
import Learning from "./pages/Learning";
import LearningArticleDetails from "./pages/LearningArticleDetails";

import OwnerRoute from "./components/OwnerRoute";
import AdminRoute from "./components/AdminRoute";
import OfflineSyncBootstrap from "./components/OfflineSyncBootstrap";
import useOnlineStatus from "./hooks/useOnlineStatus";

function MarketplaceHome() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isOnline = useOnlineStatus();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = getCurrentUser();
  const countryId = currentUser?.country_ID;

  useEffect(() => {
    async function loadProducts() {
      if (!isOnline) {
        setLoading(false);
        setError(t("marketplaceNeedsInternet"));
        return;
      }

      try {
        if (!countryId) {
          setError(t("noLoggedUserCountryFound"));
          setLoading(false);
          return;
        }

        const data = await fetchProductsByCountry(countryId);
        setProducts(data);
        setError("");
      } catch (err) {
        console.error("Fetch products error:", err);
        setError(`${t("couldNotLoadProducts")}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadProducts();
  }, [countryId, t, isOnline]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category?.name?.toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  function handleViewAll() {
    setSelectedCategory("All");
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] text-gray-900">
      <Header currentUser={currentUser} />

      <div className="px-4 mt-4">
        <LanguageSwitcher />
      </div>

      <div className="px-4 mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/my-farm")}
          className="bg-green-700 text-white px-5 py-3 rounded-full font-semibold"
        >
          {t("myFarm")}
        </button>

        <button
          onClick={() => navigate("/sell")}
          className="bg-white text-green-700 border border-green-200 px-5 py-3 rounded-full font-semibold"
        >
          {t("sellProduct")}
        </button>

        <button
          onClick={() => navigate("/learning")}
          className="bg-white text-green-700 border border-green-200 px-5 py-3 rounded-full font-semibold"
        >
          {t("learning")}
        </button>
      </div>

      {isOnline && (
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <div className="px-4 mt-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-950">
            {t("featuredListings")}
          </h2>
          <p className="text-sm text-green-700">
            {currentUser?.country?.name
              ? `${t("productsFrom")} ${currentUser.country.name}`
              : t("freshFromTrustedFarms")}
          </p>
          {!loading && !error && (
            <p className="text-xs text-gray-500 mt-1">
              {t("productsFound", { count: filteredProducts.length })}
            </p>
          )}
        </div>

        <button
          onClick={handleViewAll}
          className="text-green-800 font-medium whitespace-nowrap"
        >
          {t("viewAll")}
        </button>
      </div>

      <div className="px-4 mt-4 pb-28">
        {!isOnline && (
          <div className="bg-white rounded-[24px] p-6 text-center shadow-sm border border-orange-100 mb-4">
            <p className="text-orange-700 font-semibold">
              {t("marketplaceNeedsInternet")}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t("offlineMarketplaceHint")}
            </p>
          </div>
        )}

        {loading && <p className="text-green-700">{t("loadingProducts")}</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-[24px] p-6 text-center shadow-sm border border-green-50">
            <p className="text-gray-700 font-medium">{t("noProductsFound")}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t("tryAnotherSearch")}
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
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
  useEffect(() => {
    async function syncCurrentUser() {
      const localUser = getCurrentUser();
      if (!localUser) return;

      try {
        await refreshCurrentUser();
      } catch (error) {
        console.error("Failed to refresh current user:", error);
      }
    }

    syncCurrentUser();
  }, []);

  return (
    <>
      <OfflineSyncBootstrap />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MarketplaceHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm"
          element={
            <ProtectedRoute>
              <MyFarm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/animals"
          element={
            <ProtectedRoute>
              <MyAnimals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/animals/add"
          element={
            <ProtectedRoute>
              <AddAnimal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/animals/edit/:id"
          element={
            <ProtectedRoute>
              <EditAnimal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/incubators"
          element={
            <ProtectedRoute>
              <MyIncubators />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/incubators/add"
          element={
            <ProtectedRoute>
              <AddIncubator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/incubators/edit/:id"
          element={
            <ProtectedRoute>
              <EditIncubator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/incubators/:id/cycles"
          element={
            <ProtectedRoute>
              <IncubationCycles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/incubators/:id/cycles/add"
          element={
            <ProtectedRoute>
              <AddIncubationCycle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/incubators/:id/cycles/edit/:cycleId"
          element={
            <ProtectedRoute>
              <EditIncubationCycle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/places"
          element={
            <ProtectedRoute>
              <MyPlaces />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/places/add"
          element={
            <ProtectedRoute>
              <AddPlace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/places/edit/:id"
          element={
            <ProtectedRoute>
              <EditPlace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/cages"
          element={
            <ProtectedRoute>
              <MyCages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/cages/add"
          element={
            <ProtectedRoute>
              <AddCage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/cages/edit/:id"
          element={
            <ProtectedRoute>
              <EditCage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/equipments"
          element={
            <ProtectedRoute>
              <MyEquipments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/equipments/add"
          element={
            <ProtectedRoute>
              <AddEquipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-farm/equipments/edit/:id"
          element={
            <ProtectedRoute>
              <EditEquipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <Learning />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning/:id"
          element={
            <ProtectedRoute>
              <LearningArticleDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning/add"
          element={
            <AdminRoute>
              <AddLearningArticle />
            </AdminRoute>
          }
        />

        <Route
          path="/learning/edit/:id"
          element={
            <AdminRoute>
              <EditLearningArticle />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <OwnerRoute>
              <UserManagement />
            </OwnerRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;