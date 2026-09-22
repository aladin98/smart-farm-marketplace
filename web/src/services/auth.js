import { createUser, loginRequest, fetchCurrentUser } from "./api";

export function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function loginUser(user) {
  setCurrentUser(user);
}

export function logoutUser() {
  localStorage.removeItem("currentUser");
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

export function isOwner() {
  const user = getCurrentUser();
  return user?.role === "owner";
}

export function isAdmin() {
  const user = getCurrentUser();
  return user?.role === "admin" || user?.role === "owner";
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
    if (error.message.includes("409") || error.message.includes("Email already exists")) {
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