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

  // Hydrate auth from localStorage on mount (reliable restoration after refresh)
  useEffect(() => {
    let mounted = true;
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);
        if (mounted) {
          setUser(parsed);
          setToken(storedToken);
        }
      }
    } catch (error) {
      console.error("[AuthContext] Failed to load auth from storage", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, []);

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
