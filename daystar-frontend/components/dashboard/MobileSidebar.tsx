"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Users, DollarSign, AlertCircle, Menu, LogOut } from "lucide-react"
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
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-daystar-600">DayStar</h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-daystar-50 text-daystar-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-daystar-600" : "text-gray-400 group-hover:text-gray-500"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-daystar-100 flex items-center justify-center">
              <span className="text-daystar-700 font-semibold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Log out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
