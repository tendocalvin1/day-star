"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertCircle, Calendar, DollarSign, Home, LogOut, Menu, Sparkles, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Attendance", href: "/dashboard/attendance", icon: Calendar },
  { name: "Children", href: "/dashboard/children", icon: Users },
  { name: "Finance", href: "/dashboard/finance", icon: DollarSign },
  { name: "Incidents", href: "/dashboard/incidents", icon: AlertCircle },
]

export default function MobileSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-slate-200 p-0">
        <div className="flex h-20 items-center px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-950">DayStar</h1>
              <p className="text-xs font-medium text-slate-500">Childcare command center</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Workspace
          </p>
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-1 rounded-r-full bg-indigo-600" />
                )}
                <Icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <div className="mb-3 flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <span className="font-semibold text-emerald-700">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="ml-3 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{user?.email}</p>
                <p className="text-xs font-medium capitalize text-slate-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-950"
            >
              <LogOut className="mr-3 h-4 w-4 text-slate-400" />
              Log out
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
