"use client"

import MobileSidebar from "./MobileSidebar"

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center">
        <MobileSidebar />
        <h1 className="ml-4 text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Placeholder for future header elements */}
      </div>
    </header>
  )
}
