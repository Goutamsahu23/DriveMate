import AppHeader from './AppHeader'

export default function DashboardLayout({ role, children }) {
  return (
    <div className="min-h-screen bg-void">
      <AppHeader role={role} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
