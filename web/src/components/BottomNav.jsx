import { useNavigate } from "react-router-dom";

function BottomNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <button
        onClick={() => navigate("/")}
        className="flex flex-col items-center text-green-700 font-medium"
      >
        <span>🏠</span>
        <span className="text-xs mt-1">Home</span>
      </button>

      <button className="flex flex-col items-center text-gray-500">
        <span>📂</span>
        <span className="text-xs mt-1">Categories</span>
      </button>

      <button
        onClick={() => navigate("/sell")}
        className="bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl -mt-8 shadow-lg"
      >
        +
      </button>

      <button className="flex flex-col items-center text-gray-500">
        <span>📦</span>
        <span className="text-xs mt-1">Orders</span>
      </button>

      <button
        onClick={() => navigate("/profile")}
        className="flex flex-col items-center text-gray-500"
      >
        <span>👤</span>
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
}

export default BottomNav;