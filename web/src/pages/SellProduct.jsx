import { useNavigate } from "react-router-dom";

function SellProduct() {
  const navigate = useNavigate();

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
        <p className="text-gray-600 mb-6">
          Add your product details to publish it in the marketplace.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600">
              <option>Animals</option>
              <option>Services</option>
              <option>Veterinarian</option>
              <option>Couveuses</option>
              <option>Equipment</option>
              <option>Feed</option>
              <option>Medicines</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="text"
              placeholder="e.g. 6 weeks, 1 year"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Describe your product"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="Enter price"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter phone number"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="Enter city"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              Delivery Available
            </span>
            <input type="checkbox" className="w-5 h-5 accent-green-700" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL
            </label>
            <input
              type="text"
              placeholder="Paste image URL for now"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <button className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg mt-4">
            Publish Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellProduct;