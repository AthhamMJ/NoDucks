import api from "./api";

export function updateMe(data) {
  return api.patch("/api/auth/me", data);
}

export function deleteMe() {
  return api.delete("/api/auth/me");
}