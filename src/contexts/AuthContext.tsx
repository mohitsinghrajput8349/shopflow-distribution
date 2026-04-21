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

const TOKEN_KEY = "fmcg_token";
const USER_KEY = "fmcg_user";

function loadCachedUser(): UserResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(loadCachedUser());
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.me()
        .then((u) => {
          setUser(u);
          localStorage.setItem(USER_KEY, JSON.stringify(u));
        })
        .catch((err) => {
          // Backend /auth/me may be broken (returns 403 even for valid tokens).
          // Only clear the session on explicit 401 Unauthorized; otherwise
          // keep the cached user from the last successful login.
          const msg = String(err?.message || "").toLowerCase();
          if (msg.includes("unauthorized") || msg.includes("401")) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone: string; role?: string }) => {
    const res = await authApi.register(data);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
