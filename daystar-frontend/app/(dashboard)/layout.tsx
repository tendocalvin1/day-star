import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-full">
        <aside className="w-64 border-r border-gray-200 bg-gray-50">
          <nav className="p-4">
            <p className="text-sm font-semibold text-gray-500">Navigation</p>
            <p className="text-sm text-gray-600">Coming soon...</p>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          <header className="border-b border-gray-200 bg-white px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </header>
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
