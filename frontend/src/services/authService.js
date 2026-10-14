import { apiCall } from "./api";

export const signUp = async (userData) => {
  // Expects { name, email, password }
  return await apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const signIn = async (credentials) => {
  // Expects { email, password }
  return await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};
