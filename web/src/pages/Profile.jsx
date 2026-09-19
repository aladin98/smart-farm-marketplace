import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../services/auth";
import fallbackImage from "../assets/images/fallback-product.jpg";

function Profile() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            Not logged in
          </h2>
          <p className="text-gray-600 mb-4">
            Please login to access your profile.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] shadow-sm p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <img
            src={currentUser.profilePhoto || fallbackImage}
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            className="w-28 h-28 rounded-full object-cover border-4 border-green-100 shadow-sm"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />

          <h1 className="text-3xl font-bold text-green-950 mt-4">
            {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="text-gray-500 mt-1">{currentUser.email}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.phoneNumber || "N/A"}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">ID Card Number</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.idCardNumber || "N/A"}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">City</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.city || "N/A"}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">Country</p>
            <p className="font-semibold text-gray-900 mt-1">
              {currentUser.country?.name || "N/A"}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button className="w-full bg-green-700 text-white py-3 rounded-full font-semibold">
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 py-3 rounded-full font-semibold border border-red-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;