"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Users, FolderOpen, CreditCard, Settings, LogOut, Menu, X, Shield, Home, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  
  const links = [
    { href: "/admin", icon: BarChart3, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/projects", icon: FolderOpen, label: "Projects" },
    { href: "/admin/payments", icon: CreditCard, label: "Payments" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-6">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <Link
            href="/dashboard"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-transform duration-200 ease-in-out
          flex flex-col
          h-full
          shadow-lg
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">UmojaFund</span>
              <p className="text-sm text-gray-500">Administration</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary text-white font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {user?.role === 'superadmin' ? 'Super Admin' : 'Administrateur'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Home size={18} />
              <span className="text-sm">Tableau de bord utilisateur</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 
                text-red-600 hover:bg-red-50 rounded-lg 
                transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-lg font-semibold text-gray-900">
              {pathname === '/admin' ? 'Tableau de bord' : 
               pathname.includes('/admin/projects') ? 'Gestion des projets' :
               pathname.includes('/admin/users') ? 'Gestion des utilisateurs' :
               'Administration'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}