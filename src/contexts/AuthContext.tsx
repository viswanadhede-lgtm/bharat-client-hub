import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser, getUser, isAuthenticated, storeAuth, clearAuth } from "@/utils/auth";
import SHA256 from "crypto-js/sha256";

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const password_hash = SHA256(password).toString();

    const res = await fetch("https://dev.bharathbots.com/webhook/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password_hash }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success !== true) {
      throw new Error(data.message || "Invalid credentials");
    }

    // Store token and decode user from it
    storeAuth(data.token);
    setUser(getUser());
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
