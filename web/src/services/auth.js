import { fetchUsers, createUser } from "./api";

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
  return user?.role === "admin";
}

export async function authenticateUser(email, password) {
  const users = await fetchUsers();

  const matchedUser = users.find(
    (user) => user.email === email && user.passwordHash === password
  );

  if (!matchedUser) {
    return null;
  }

  loginUser(matchedUser);
  return matchedUser;
}

export async function registerUser(formData) {
  const users = await fetchUsers();

  const existingUser = users.find((user) => user.email === formData.email);

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

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
  };

  return await createUser(payload);
}