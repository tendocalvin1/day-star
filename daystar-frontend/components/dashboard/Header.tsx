"use client"

import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"
import MobileSidebar from "./MobileSidebar"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/attendance": "Attendance",
  "/dashboard/children": "Children",
  "/dashboard/finance": "Finance",
  "/dashboard/incidents": "Incidents",
}

export default function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center">
        <MobileSidebar />
        <h1 className="ml-3 text-lg font-semibold text-slate-950 md:ml-0">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 shadow-sm sm:flex">
          <Search className="h-4 w-4" />
          <span>Search DayStar</span>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
