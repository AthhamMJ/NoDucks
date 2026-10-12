import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiRequest("/api/auth/me", {
          accessToken: token,
        });

        if (active) {
          setUser(data.profile ?? data.user ?? null);
        }
      } catch {
        if (active) {
          localStorage.removeItem("accessToken");
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  const login = (authData) => {
    if (authData?.accessToken) {
      localStorage.setItem("accessToken", authData.accessToken);
    }
    if (authData?.user) {
      setUser(authData.user);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      if (token) {
        await apiRequest("/api/auth/signout", {
          method: "POST",
          accessToken: token,
        });
      }
    } catch {
      // Ignored if session is already expired
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
