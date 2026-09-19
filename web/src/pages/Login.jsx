import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const users = await fetchUsers();

      const matchedUser = users.find(
        (user) =>
          user.email === formData.email &&
          user.passwordHash === formData.password
      );

      if (!matchedUser) {
        setMessage("Invalid email or password.");
        setSubmitting(false);
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(matchedUser));

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      console.error(error);
      setMessage("Failed to login.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-900">Smart Farm</h1>
          <p className="text-lg text-green-700">MarketPlace</p>
          <p className="text-gray-500 mt-3">Welcome back, log in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              className="text-sm text-green-700 font-medium"
            >
              Forgot password?
            </button>
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
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-green-700 font-semibold"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;