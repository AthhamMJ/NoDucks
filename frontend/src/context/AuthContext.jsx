import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // why because if we let to get the token only , it will crash if the token doesn't exist
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [loading, setLoading] = useState(true);

  // prevent the page from refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // fetch the details using the saved token on page refresh
          const { data } = await api.get("/api/auth/me");
          setUser(data.user);
        } catch (error) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // Apply the saved theme to the whole app whenever the user changes
  useEffect(() => {
    const isDark = user?.preferences?.darkMode ?? false;
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, [user]);

  // Login handler receives data from your Express /backend ({ token, user })
  const login = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
