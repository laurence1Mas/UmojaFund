"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { usePathname } from "next/navigation"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <div>
              <span className="font-bold text-xl text-primary">UmojaFund</span>
              <p className="text-xs text-gray-500 -mt-1">Crowdfunding Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink(link.href)
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-gray-700 hover:text-primary hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    >
                      <User size={16} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-red-50 text-sm text-red-600 w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="space-y-1 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActiveLink(link.href)
                      ? "bg-primary text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              {user ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-primary font-medium hover:bg-primary/10 rounded-lg mb-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-4 py-3 text-primary font-medium hover:bg-gray-100 rounded-lg mb-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-3 bg-primary text-white rounded-lg text-center font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}