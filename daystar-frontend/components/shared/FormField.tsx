import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  error?: string
  helpText?: string
  children: React.ReactNode
  className?: string
}

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon
  hasError?: boolean
}

type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: LucideIcon
  hasError?: boolean
}

type TextAreaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean
}

export function FormField({ label, error, helpText, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : helpText ? (
        <p className="text-sm text-slate-500">{helpText}</p>
      ) : null}
    </div>
  )
}

export const inputBaseClassName =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"

export function TextInput({ icon: Icon, hasError, className, ...props }: TextInputProps) {
  if (Icon) {
    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={cn(inputBaseClassName, "pl-9", hasError && "border-red-300 focus:border-red-300 focus:ring-red-100", className)}
          {...props}
        />
      </div>
    )
  }

  return (
    <input
      className={cn(inputBaseClassName, hasError && "border-red-300 focus:border-red-300 focus:ring-red-100", className)}
      {...props}
    />
  )
}

export function SelectInput({ icon: Icon, hasError, className, children, ...props }: SelectInputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <select
        className={cn(inputBaseClassName, Icon && "pl-9", hasError && "border-red-300 focus:border-red-300 focus:ring-red-100", className)}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function TextAreaInput({ hasError, className, ...props }: TextAreaInputProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        hasError && "border-red-300 focus:border-red-300 focus:ring-red-100",
        className
      )}
      {...props}
    />
  )
}
