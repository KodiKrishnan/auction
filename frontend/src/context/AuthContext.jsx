import { createContext, useContext, useState, useEffect } from "react";
import { logoutUser } from "../features/auth/authAPI";
import AuthModal from "../components/dialogs/AuthModal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Global login modal state (stores stashed callback and requested role)
  const [authModal, setAuthModal] = useState({ open: false, onSuccess: null, role: "TRAVELLER" });

  useEffect(() => {
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
      await logoutUser(); 
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role"); 
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

  // Open the login modal and stash the callback action and role
  const openLoginModal = (onSuccessCallback, role = "TRAVELLER") => {
    setAuthModal({ open: true, onSuccess: onSuccessCallback, role });
  };

  // Close the login modal
  const closeLoginModal = () => {
    setAuthModal({ open: false, onSuccess: null, role: "TRAVELLER" });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, loading, login, logout, updateUser, 
        authModal, openLoginModal, closeLoginModal
      }}
    >
      {!loading && children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};