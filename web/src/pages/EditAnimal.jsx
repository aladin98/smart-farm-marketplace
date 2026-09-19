import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateFarmAnimal } from "../services/api";

function EditAnimal() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const animal = state?.animal;

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(animal?.photoUrl || "");

  const [formData, setFormData] = useState({
    customName: animal?.customName || "",
    quantity: animal?.quantity || "",
    notes: animal?.notes || "",
    photoUrl: animal?.photoUrl || "",
  });

  if (!animal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            Animal not found
          </h2>
          <button
            onClick={() => navigate("/my-farm/animals")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            Back to Animals
          </button>
        </div>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    try {
      await updateFarmAnimal(animal.ID, {
        customName: formData.customName,
        quantity: parseInt(formData.quantity, 10),
        notes: formData.notes,
        photoUrl: formData.photoUrl,
      });

      setMessage("Animal updated successfully!");

      setTimeout(() => {
        navigate("/my-farm/animals");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Failed to update animal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() => navigate("/my-farm/animals")}
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">Edit Animal</h1>
        <p className="text-gray-600 mb-6">
          Update animal quantity, notes, name, and photo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animal Photo
            </label>

            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-52 rounded-2xl overflow-hidden border border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Animal Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green-700 text-sm">
                    No animal photo selected
                  </span>
                )}
              </div>

              <label className="inline-block cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Custom Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Name
            </label>
            <input
              type="text"
              name="customName"
              value={formData.customName}
              onChange={handleChange}
              placeholder="Custom animal name"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows="4"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Update notes"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            ></textarea>
          </div>

          {message && (
            <p className="text-sm font-medium text-center text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-full font-semibold text-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditAnimal;