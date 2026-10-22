import api from "./api";

// Program updated with the axios so it uses the direct and simplified method
// to post

export const signUp = async (userData) => {
  // Expects { name, email, password }
  const { data } = await api.post("/api/auth/register", userData);
  return data;
};

export const signIn = async (credentials) => {
  // Expects { email, password }
  const { data } = await api.post("/api/auth/login", credentials);
  return data;
};
