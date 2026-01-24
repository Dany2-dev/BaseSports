import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar usuario SOLO si no es anónimo
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si ya hay usuario anónimo, no llamar /auth/me
    const isAnonymous = localStorage.getItem("anonymous") === "true";
    if (isAnonymous) {
      setUser({
        id: "anon",
        name: "Guest",
        role: "anonymous",
      });
      setLoading(false);
    } else {
      fetchUser();
    }
  }, []);

  // 🔐 Login Google (SIN CAMBIOS)
  const loginWithGoogle = () => {
    localStorage.removeItem("anonymous");
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/login/google`;
  };

  // 👤 Login anónimo
  const loginAnonymously = () => {
    localStorage.setItem("anonymous", "true");
    setUser({
      id: "anon",
      name: "Guest",
      role: "anonymous",
    });
  };

  const logout = async () => {
    localStorage.removeItem("anonymous");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginAnonymously,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
