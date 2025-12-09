"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  notifications: {
    email: boolean;
    projectUpdates: boolean;
    fundingAlerts: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
    push: boolean;
  };
}

interface UserStats {
  totalFunded: number;
  activeProjects: number;
  totalReturns: number;
  portfolioValue: number;
  totalContributions: number;
  pendingReturns: number;
  lastUpdated: Date;
}

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  walletAddress?: string
  
  // Profile fields
  phone?: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
  
  // Preferences
  preferences?: UserPreferences
  
  // Statistics
  stats?: UserStats
  
  // Security
  twoFactorEnabled?: boolean
  lastPasswordChange?: Date
  
  // Dates
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper pour gérer le storage
const storage = {
  getToken: () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("umoja_token")
  },
  setToken: (token: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem("umoja_token", token)
    // Set cookie aussi pour le middleware
    document.cookie = `umoja_token=${token}; path=/; max-age=2592000; SameSite=Strict`
  },
  removeToken: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("umoja_token")
    document.cookie = "umoja_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const storedToken = storage.getToken()
      
      if (!storedToken) {
        setUser(null)
        setToken(null)
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          setToken(storedToken)
        } else {
          // Si l'API retourne une erreur
          storage.removeToken()
          setUser(null)
          setToken(null)
        }
      } else {
        storage.removeToken()
        setUser(null)
        setToken(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      storage.removeToken()
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        storage.setToken(data.token)
        setToken(data.token)
        setUser(data.user)
        
        // Redirection basée sur le rôle
        if (data.user.role === 'admin' || data.user.role === 'superadmin') {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        
        return { success: true }
      } else {
        return { success: false, message: data.error }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Erreur de connexion" }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        storage.setToken(data.token)
        setToken(data.token)
        setUser(data.user)
        
        // Redirection basée sur le rôle
        if (data.user.role === 'admin' || data.user.role === 'superadmin') {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        
        return { success: true }
      } else {
        return { success: false, message: data.error }
      }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, message: "Erreur lors de l'inscription" }
    }
  }

  const logout = () => {
    storage.removeToken()
    setUser(null)
    setToken(null)
    router.push("/auth/login?logout=true")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      isAuthenticated,
      login, 
      register, 
      logout, 
      checkAuth,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}