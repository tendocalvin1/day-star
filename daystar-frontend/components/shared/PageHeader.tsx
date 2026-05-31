import * as React from "react"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
