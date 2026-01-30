import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

/* =========================
   Auth Context Setup
========================= */
const AuthContext = createContext(null);

/* =========================
   Custom Hook
========================= */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

/* =========================
   Provider
========================= */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage synchronously to prevent loading flicker
  useState(() => {
    console.log("[AuthContext] Initializing auth state from localStorage...");
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        console.log("[AuthContext] Found existing auth data");
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        console.log("[AuthContext] No existing auth data found");
      }
    } catch (error) {
      console.error("[AuthContext] Failed to load auth from storage", error);
      localStorage.clear();
    } finally {
      // Only set loading to false after initial sync
      setLoading(false);
    }
  });

  /* =========================
     Login
  ========================= */
  const login = useCallback((authToken, userData) => {
    console.log("[AuthContext] Login called");
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(authToken);
    setUser(userData);
    console.log("[AuthContext] Login successful");
  }, []);

  /* =========================
     Logout
  ========================= */
  const logout = useCallback(() => {
    console.log("[AuthContext] Logout called");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
    console.log("[AuthContext] Logout successful");
  }, []);

  /* =========================
     Update User
  ========================= */
  const updateUser = useCallback((userData) => {
    console.log("[AuthContext] UpdateUser called");
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  /* =========================
     Context Value
  ========================= */
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
    isBarber: user?.role?.toUpperCase() === "BARBER",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
