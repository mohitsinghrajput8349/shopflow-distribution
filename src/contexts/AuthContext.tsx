import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, type UserResponse } from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone: string; role?: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isShopOwner: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("fmcg_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.me()
        .then(setUser)
        .catch((err) => {
          // Backend /auth/me may be broken (returns 403 even for valid tokens).
          // Only clear token on explicit 401 Unauthorized; keep session otherwise.
          const msg = String(err?.message || "");
          if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
            localStorage.removeItem("fmcg_token");
            setToken(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("fmcg_token", res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone: string; role?: string }) => {
    const res = await authApi.register(data);
    localStorage.setItem("fmcg_token", res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fmcg_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, login, register, logout,
      isAdmin: user?.role === "ADMIN",
      isShopOwner: user?.role === "SHOP_OWNER",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
