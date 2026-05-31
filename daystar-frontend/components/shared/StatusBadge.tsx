import * as React from "react"
import { cn } from "@/lib/utils"

type StatusBadgeTone = "default" | "success" | "warning" | "danger" | "info" | "neutral"

type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusBadgeTone
}

const toneClasses: Record<StatusBadgeTone, string> = {
  default: "border-indigo-100 bg-indigo-50 text-indigo-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-red-100 bg-red-50 text-red-700",
  info: "border-sky-100 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
}

export function StatusBadge({
  tone = "default",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
