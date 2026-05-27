"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./useAuth";

export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname === "/login" || pathname?.startsWith("/auth");
    if (!isAuthenticated && !isAuthPage) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router, pathname]);

  return { isAuthenticated, loading };
}

export default useProtectedRoute;
