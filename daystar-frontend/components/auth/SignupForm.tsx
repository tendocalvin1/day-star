"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, SelectInput, TextInput } from "@/components/shared/FormField";

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
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

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
        <SelectInput
          icon={ShieldCheck}
          hasError={!!errors.role}
          {...register("role")}
          aria-invalid={!!errors.role}
        >
          <option value="">Select a role</option>
          <option value="manager">Manager</option>
          <option value="babysitter">Babysitter</option>
        </SelectInput>
      </FormField>

      <div className="space-y-4 pt-1">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Sign up"}
        </Button>
        <div className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-700 hover:text-indigo-600">
            Sign in
          </Link>
        </div>
      </div>
    </form>
  );
}

export default SignupForm;
