"use client";

import { useMutation } from "@tanstack/react-query";
import * as authApi from "../services/api/auth";

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}

export default useLogout;
