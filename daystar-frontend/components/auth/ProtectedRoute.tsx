"use client";

import React from "react";
import { useProtectedRoute } from "../../hooks/useProtectedRoute";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useProtectedRoute();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          Loading DayStar
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // redirect handled by hook; render nothing during transition
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
