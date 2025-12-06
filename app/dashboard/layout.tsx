"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Wallet, 
  Folder, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  const links = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/projects", icon: Folder, label: "My Projects" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen-safe bg-background">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static
            inset-y-0 left-0 z-50
            w-64 bg-card border-r border-border
            transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            transition-transform duration-200 ease-in-out
            flex flex-col
            h-full
          `}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <span className="font-bold text-xl">UmojaFund</span>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon
              const active = isActiveLink(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                text-destructive hover:bg-destructive/10 rounded-lg 
                transition-colors font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-muted"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-full md:w-64 lg:w-80
                      border border-input rounded-lg 
                      bg-background focus:outline-none focus:ring-2 focus:ring-ring
                      placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  className="p-2 rounded-lg hover:bg-muted relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </button>
                
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">View profile</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}