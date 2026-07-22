import { createContext, useContext, useState, useEffect } from "react";
import { logoutUser } from "../features/auth/authAPI";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from sessionStorage on refresh
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      sessionStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };
  

  const logout = async () => {
    try {
      await logoutUser(); // sends Bearer token via interceptor 
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role"); 
      
      // Clear the welcome flag on logout
      sessionStorage.removeItem("hasSeenWelcome"); 
    }
  };


  const updateUser = (partial) => {
    setUser((prev) => {
      const updated = { ...prev, ...partial };
      sessionStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};