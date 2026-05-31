import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type StatCardTone = "indigo" | "emerald" | "sky" | "amber" | "red" | "slate"

type StatCardProps = {
  title: string
  value: React.ReactNode
  description?: string
  icon?: LucideIcon
  trend?: React.ReactNode
  tone?: StatCardTone
  isLoading?: boolean
}

const toneClasses: Record<StatCardTone, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  tone = "indigo",
  isLoading,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="mt-2 text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : value}
            </CardTitle>
          </div>
          {Icon && (
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardHeader>
      {(description || trend || isLoading) && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-medium text-slate-500">
              {isLoading ? <Skeleton className="h-4 w-24" /> : description}
            </span>
            {trend && !isLoading && (
              <span className="text-xs font-semibold text-emerald-700">{trend}</span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
