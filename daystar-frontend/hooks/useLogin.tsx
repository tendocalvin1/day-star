"use client";

import { useMutation } from "@tanstack/react-query";
import * as authApi from "../services/api/auth";

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export default useLogin;
