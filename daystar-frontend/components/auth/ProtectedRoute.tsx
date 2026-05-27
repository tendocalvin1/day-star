"use client";

import React from "react";
import { useProtectedRoute } from "../../hooks/useProtectedRoute";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useProtectedRoute();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-daystar-500" />
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
