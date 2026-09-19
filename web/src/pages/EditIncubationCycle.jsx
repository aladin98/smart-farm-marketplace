import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateIncubationCycle } from "../services/api";

function EditIncubationCycle() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const cycle = state?.cycle;
  const incubator = state?.incubator;

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    eggsCount: cycle?.eggsCount || "",
    startDate: cycle?.startDate || "",
    checkDate: cycle?.checkDate || "",
    stopDate: cycle?.stopDate || "",
    hatchDate: cycle?.hatchDate || "",
    status: cycle?.status || "Running",
    notes: cycle?.notes || "",
  });

  if (!cycle || !incubator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            Cycle not found
          </h2>
          <button
            onClick={() => navigate("/my-farm/incubators")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            Back
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await updateIncubationCycle(cycle.ID, {
        eggsCount: parseInt(formData.eggsCount, 10),
        startDate: formData.startDate,
        checkDate: formData.checkDate,
        stopDate: formData.stopDate,
        hatchDate: formData.hatchDate,
        status: formData.status,
        notes: formData.notes,
      });

      setMessage("Cycle updated successfully!");

      setTimeout(() => {
        navigate(`/my-farm/incubators/${incubator.ID}/cycles`, {
          state: { incubator },
        });
      }, 1000);
    } catch (error) {
      console.error("Edit cycle error:", error);
      setMessage(`Failed to update cycle: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-10">
      <button
        onClick={() =>
          navigate(`/my-farm/incubators/${incubator.ID}/cycles`, {
            state: { incubator },
          })
        }
        className="mb-4 text-green-800 font-medium"
      >
        ← Back
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-950 mb-2">
          Edit Incubation Cycle
        </h1>
        <p className="text-gray-600 mb-6">
          Update cycle for <strong>{incubator.name}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eggs Count
            </label>
            <input
              type="number"
              name="eggsCount"
              value={formData.eggsCount}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Date
              </label>
              <input
                type="date"
                name="checkDate"
                value={formData.checkDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stop Date
              </label>
              <input
                type="date"
                name="stopDate"
                value={formData.stopDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hatch Date
              </label>
              <input
                type="date"
                name="hatchDate"
                value={formData.hatchDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
            >
              <option value="Planned">Planned</option>
              <option value="Running">Running</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows="4"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
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

export default EditIncubationCycle;