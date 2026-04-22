"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";
import { clearAuth } from "@/lib/axios";
import type { User, LoginPayload, RegisterPayload } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const COOKIE_OPTS = { expires: 7, secure: true, sameSite: "strict" as const };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  // Bootstrap: if we have a token cookie, load the user will do the work
  useEffect(() => {
    const token = Cookies.get("educore_access");
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (data: LoginPayload) => {
    const { data: tokens } = await authApi.login(data);

    Cookies.set("educore_access",  tokens.access,  COOKIE_OPTS);
    Cookies.set("educore_refresh", tokens.refresh, COOKIE_OPTS);

    const { data: me } = await authApi.getMe();

    // Block pending instructors early — give them a clear message
    if (me.is_instructor && me.instructor_status === "pending") {
      clearAuth();
      throw new Error("pending_approval");
    }
    if (me.is_instructor && me.instructor_status === "rejected") {
      clearAuth();
      throw new Error("account_rejected");
    }

    const role = me.is_instructor ? "instructor" : me.is_staff ? "admin" : "student";
    Cookies.set("educore_role",     role,                   COOKIE_OPTS);
    Cookies.set("educore_is_staff", String(me.is_staff),   COOKIE_OPTS);
    setUser(me);
  };

  const register = async (data: RegisterPayload) => {
    await authApi.register(data);
    // After register, auto-login
    await login({ username: data.username, password: data.password });
  };

  const logout = () => {
    clearAuth();
    Cookies.remove("educore_is_staff");
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}