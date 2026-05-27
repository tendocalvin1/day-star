"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import api from "../services/api/client";
import { useQueryClient } from "@tanstack/react-query";

type User = { id: number; name?: string; email?: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");
      setUser(res.data ?? null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
    function onUnauthorized() {
      setUser(null);
    }
    window.addEventListener("ds:unauthorized", onUnauthorized as EventListener);
    return () => window.removeEventListener("ds:unauthorized", onUnauthorized as EventListener);
  }, [fetchMe]);

  const login = async (payload: { email: string; password: string }) => {
    const res = await api.post("/auth/login", payload);
    // backend should set httpOnly cookie and return user
    setUser(res.data.user ?? null);
    window.dispatchEvent(new CustomEvent("ds:login"));
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    qc.clear();
    window.dispatchEvent(new CustomEvent("ds:logout"));
  };

  const refresh = async () => fetchMe();

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
