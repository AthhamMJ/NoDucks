import { apiRequest } from "./api";

export function signUp({ name, email, password }) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

export function signIn({ email, password }) {
  return apiRequest("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function getAuthenticatedProfile(accessToken) {
  return apiRequest("/api/auth/me", {
    accessToken,
  });
}

export function signOut(accessToken) {
  return apiRequest("/api/auth/signout", {
    method: "POST",
    accessToken,
  });
}
