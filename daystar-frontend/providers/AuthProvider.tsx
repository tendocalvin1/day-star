"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import * as authApi from "../services/api/auth";
import { toast } from "sonner";

export type User = authApi.User | null;

export type AuthContextValue = {
  user: User;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
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
  const qc = useQueryClient();

  const {
    data: meData,
    isFetching: loading,
    refetch: refetchMe,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    retry: false,
    refetchOnWindowFocus: false,
    select: (data) => data?.user ?? null,
  });

  const [user, setUser] = useState<User>(meData ?? null);

  useEffect(() => {
    setUser(meData ?? null);
  }, [meData]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess(data) {
      setUser(data.user ?? null);
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Signed in");
      window.dispatchEvent(new CustomEvent("ds:login"));
    },
    onError(err: unknown) {
      const message = (err as any)?.response?.data?.message ?? "Sign in failed";
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess() {
      setUser(null);
      qc.removeQueries();
      toast("Signed out");
      window.dispatchEvent(new CustomEvent("ds:logout"));
    },
    onError() {
      toast.error("Sign out failed");
    },
  });

  useEffect(() => {
    function onUnauthorized() {
      setUser(null);
      qc.removeQueries();
    }
    window.addEventListener("ds:unauthorized", onUnauthorized as EventListener);
    return () => window.removeEventListener("ds:unauthorized", onUnauthorized as EventListener);
  }, [qc]);

  const login = async (payload: { email: string; password: string }) => {
    await loginMutation.mutateAsync(payload);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const refresh = async () => {
    await refetchMe();
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, logout, refresh }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
