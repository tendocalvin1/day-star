"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/shared/FormField";

const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values);
      router.push('/dashboard');
    } catch (e) {
      // AuthProvider handles toasts; surface nothing here
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField label="Email" error={errors.email?.message}>
        <TextInput
          icon={Mail}
          type="email"
          placeholder="you@daystar.com"
          autoComplete="email"
          hasError={!!errors.email}
          {...register("email")}
          aria-invalid={!!errors.email}
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <TextInput
          icon={Lock}
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          hasError={!!errors.password}
          {...register("password")}
          aria-invalid={!!errors.password}
        />
      </FormField>

      <div className="space-y-3 pt-1">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-xs leading-5 text-slate-500">
          Protected workspace access for DayStar staff.
        </p>
      </div>
    </form>
  );
}

export default LoginForm;
