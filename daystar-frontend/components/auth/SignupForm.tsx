// TODO: This is a placeholder form to demonstrate the UI. Replace with actual signup logic and API integration.
// Note: The form includes fields for email, password, confirm password, and role selection. Validation is handled using Zod and react-hook-form.
"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/shared/FormField";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum(["manager", "babysitter"], { message: "Please select a role" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });
  const selectedRole = watch("role");

  async function onSubmit(values: SignupFormValues) {
    try {
      // TODO: Replace with actual signup API call
      toast.info("Signup feature coming soon!");
      console.log("Signup values:", values);
    } catch (e) {
      toast.error("Signup failed");
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
          placeholder="Create a password"
          autoComplete="new-password"
          hasError={!!errors.password}
          {...register("password")}
          aria-invalid={!!errors.password}
        />
      </FormField>

      <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
        <TextInput
          icon={Lock}
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          hasError={!!errors.confirmPassword}
          {...register("confirmPassword")}
          aria-invalid={!!errors.confirmPassword}
        />
      </FormField>

      <FormField label="Role" error={errors.role?.message} helpText="Choose the access level for this account.">
        <input type="hidden" {...register("role")} />
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "manager", label: "Manager", helper: "Admin access" },
            { value: "babysitter", label: "Babysitter", helper: "Care access" },
          ].map((role) => (
            <label
              key={role.value}
              className={cn(
                "cursor-pointer rounded-lg border bg-white p-3 text-sm shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/50",
                selectedRole === role.value
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-slate-200",
                errors.role && "border-red-300"
              )}
            >
              <input
                type="radio"
                value={role.value}
                className="sr-only"
                {...register("role")}
              />
              <span className="flex items-center gap-2 font-semibold text-slate-950">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                {role.label}
              </span>
              <span className="mt-1 block text-xs text-slate-500">{role.helper}</span>
            </label>
          ))}
        </div>
      </FormField>

      <div className="space-y-4 pt-1">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Sign up"}
        </Button>
        <div className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-600">
            Sign in
          </Link>
        </div>
      </div>
    </form>
  );
}

export default SignupForm;
