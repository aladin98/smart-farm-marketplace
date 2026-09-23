import { createUser, loginRequest, fetchCurrentUser } from "./api";

export function getCurrentUser() {
  try {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse currentUser from localStorage:", error);
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } catch (error) {
    console.error("Failed to store currentUser in localStorage:", error);
  }
}

export function loginUser(user) {
  setCurrentUser(user);
}

export function logoutUser() {
  try {
    localStorage.removeItem("currentUser");
  } catch (error) {
    console.error("Failed to remove currentUser from localStorage:", error);
  }
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

export function isOwner() {
  const user = getCurrentUser();
  return String(user?.role || "").toLowerCase() === "owner";
}

export function isAdmin() {
  const role = String(getCurrentUser()?.role || "").toLowerCase();
  return role === "admin" || role === "owner";
}

export async function authenticateUser(email, password) {
  try {
    const user = await loginRequest(email, password);
    loginUser(user);
    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function registerUser(formData) {
  const payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    passwordHash: formData.password,
    phoneNumber: formData.phoneNumber,
    idCardNumber: formData.idCardNumber,
    city: formData.city,
    country_ID: formData.country_ID,
    profilePhoto: formData.profilePhoto,
    role: "user",
  };

  try {
    return await createUser(payload);
  } catch (error) {
    if (
      error.message.includes("409") ||
      error.message.includes("Email already exists")
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function refreshCurrentUser() {
  const localUser = getCurrentUser();

  if (!localUser?.email) {
    return null;
  }

  try {
    const freshUser = await fetchCurrentUser();
    setCurrentUser(freshUser);
    return freshUser;
  } catch (error) {
    console.error("Failed to refresh current user:", error);

    const message = error?.message || "";

    if (
      message.includes("401") ||
      message.includes("404") ||
      message.includes("Unauthorized") ||
      message.includes("User not found")
    ) {
      logoutUser();
      return null;
    }

    return localUser;
  }
}