import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Only sign out + redirect on genuine auth failures (401).
    // 429 (quota exceeded), 403, 500, etc. should NOT sign the user out.
    if (status === 401) {
      localStorage.removeItem("token");
      if (
        !window.location.pathname.startsWith("/login") &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/";
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // Attach status so callers can distinguish quota errors from auth errors
    const enrichedError = new Error(message);
    enrichedError.status = status;
    return Promise.reject(enrichedError);
  },
);

export default api;
