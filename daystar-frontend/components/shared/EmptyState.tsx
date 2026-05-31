import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  tone?: "default" | "danger"
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-sm",
            tone === "danger" ? "text-red-600" : "text-indigo-600"
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
