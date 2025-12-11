"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Search, Filter, Clock, Users, TrendingUp, DollarSign, Eye, CheckCircle, ChevronLeft, ChevronRight, Heart, MapPin, Target, Zap, Star, TrendingDown, Calendar, Percent } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { useApi } from "@/lib/hooks/useApi"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  _id: string
  title: string
  shortDescription: string
  description?: string
  category: string
  creatorName: string
  fundingGoal: number
  fundedAmount: number
  currency: string
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'failed'
  verified: boolean
  backersCount: number
  images: string[]
  startDate?: string
  endDate?: string
  duration?: number
  minInvestment?: number
  expectedROI?: number
  featured?: boolean
  createdAt: string
  updatedAt: string
  location?: string
}

interface ProjectFilters {
  category: string
  status: string
  search: string
  sortBy: 'createdAt' | 'fundingGoal' | 'fundedAmount' | 'backersCount' | 'endDate' | 'expectedROI'
  sortOrder: 'asc' | 'desc'
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface ApiResponse {
  success: boolean
  data: Project[]
  pagination: PaginationData
}

const categoryLabels: Record<string, string> = {
  'environment': '🌱 Environnement',
  'education': '📚 Éducation',
  'technology': '💻 Technologie',
  'health': '🏥 Santé',
  'agriculture': '🌾 Agriculture',
  'energy': '⚡ Énergie',
  'community': '🏘️ Communauté',
  'arts': '🎨 Arts & Culture',
  'other': '📦 Autre'
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  'active': { label: 'Actif', color: 'text-green-700', bgColor: 'bg-green-100 border-green-200' },
  'pending': { label: 'En attente', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-200' },
  'draft': { label: 'Brouillon', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200' },
  'completed': { label: 'Terminé', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200' },
  'cancelled': { label: 'Annulé', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200' },
  'failed': { label: 'Échoué', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200' }
}

const sortOptions = [
  { value: 'createdAt', label: 'Plus récents', icon: Calendar },
  { value: 'fundedAmount', label: 'Plus financés', icon: TrendingUp },
  { value: 'backersCount', label: 'Plus populaires', icon: Users },
  { value: 'endDate', label: 'Bientôt terminés', icon: Clock },
  { value: 'expectedROI', label: 'Rendement élevé', icon: Percent },
  { value: 'fundingGoal', label: 'Montant élevé', icon: DollarSign }
]

export default function ProjectsPage() {
  const { fetchApi } = useApi()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  })
  
  const [filters, setFilters] = useState<ProjectFilters>({
    category: 'all',
    status: 'active',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Initial fetch
  useEffect(() => {
    fetchProjects(1)
  }, [])

  // Fetch projects avec pagination
  const fetchProjects = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Construire les paramètres de requête
      const queryParams = new URLSearchParams()
      if (filters.status !== 'all') queryParams.append('status', filters.status)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.category !== 'all') queryParams.append('category', filters.category)
      queryParams.append('sortBy', filters.sortBy)
      queryParams.append('sortOrder', filters.sortOrder)
      queryParams.append('page', page.toString())
      queryParams.append('limit', pagination.limit.toString())
      
      const response = await fetchApi(`/projects?${queryParams.toString()}`, {
        requiresAuth: false
      }) as ApiResponse
      
      if (response.success && Array.isArray(response.data)) {
        setProjects(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      } else {
        setError("Impossible de charger les projets")
        setProjects([])
      }
    } catch (err: any) {
      console.error("Error fetching projects:", err)
      setError(err.message || "Erreur lors du chargement des projets")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    fetchProjects(1)
  }, [filters.category, filters.status, filters.sortBy, filters.sortOrder])

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchProjects(1)
      }
    }, 500) // 500ms debounce
    
    return () => clearTimeout(timer)
  }, [filters.search])

  // Catégories uniques pour les filtres
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(projects.map(p => p.category)))
    return uniqueCategories.map(cat => ({
      value: cat,
      label: categoryLabels[cat] || cat,
      count: projects.filter(p => p.category === cat).length
    }))
  }, [projects])

  // Statistiques
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length
    const totalRaised = projects.reduce((sum, p) => sum + p.fundedAmount, 0)
    const totalBackers = projects.reduce((sum, p) => sum + p.backersCount, 0)
    const successRate = projects.length > 0 
      ? (projects.filter(p => p.status === 'completed').length / projects.length * 100).toFixed(1)
      : '0'
    
    return { activeProjects, totalRaised, totalBackers, successRate }
  }, [projects])

  // Projets récents (pour la sidebar) - toujours les 5 plus récents
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [projects])

  // Projets en vedette
  const featuredProjects = useMemo(() => {
    return projects
      .filter(p => p.featured && p.status === 'active')
      .slice(0, 3)
  }, [projects])

  const formatCurrency = (amount: number, currency: string = 'ADA') => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ' + currency
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M'
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K'
    }
    return amount.toString()
  }

  const calculateProgress = (funded: number, goal: number) => {
    if (goal === 0) return 0
    return Math.min(100, (funded / goal) * 100)
  }

  const calculateDaysLeft = (endDate?: string) => {
    if (!endDate) return 0
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      fetchProjects(page)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Générer la plage de pages à afficher
  const getPageRange = () => {
    const delta = 2 // nombre de pages à afficher de chaque côté
    const range = []
    const start = Math.max(2, pagination.page - delta)
    const end = Math.min(pagination.pages - 1, pagination.page + delta)
    
    // Toujours afficher la première page
    range.push(1)
    
    // Ajouter ellipsis si nécessaire
    if (start > 2) {
      range.push('...')
    }
    
    // Ajouter les pages autour de la page courante
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    
    // Ajouter ellipsis si nécessaire
    if (end < pagination.pages - 1) {
      range.push('...')
    }
    
    // Toujours afficher la dernière page si différente de la première
    if (pagination.pages > 1) {
      range.push(pagination.pages)
    }
    
    return range
  }

  // Gérer le clic sur le bouton contribuer
  const handleContributeClick = (projectId: string) => {
    // Rediriger vers la page de contribution - accessible à tous
    router.push(`/projects/${projectId}/contribute`)
  }

  const resetFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Explorer les projets</h1>
              <p className="text-xl text-white/80">Découvrez des projets innovants qui font la différence</p>
            </div>
          </section>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="flex justify-between mt-4">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section avec dégradé */}
        <section className="bg-gradient-to-r from-primary via-primary/95 to-secondary text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Explorer les projets
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Découvrez des projets innovants qui transforment des vies et créent un impact positif
              </p>
            </div>
            
            {/* Stats Overview amélioré */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pagination.total}</div>
                    <div className="text-sm text-white/80">Projets</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCompactCurrency(stats.totalRaised)}</div>
                    <div className="text-sm text-white/80">Levés</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCompactCurrency(stats.totalBackers)}</div>
                    <div className="text-sm text-white/80">Investisseurs</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.successRate}%</div>
                    <div className="text-sm text-white/80">Succès</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main content (projects) */}
              <div className="lg:col-span-3">
                {/* Search and Filters Bar améliorée */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un projet, une catégorie ou un créateur..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="md:hidden inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <Filter className="w-5 h-5" />
                        Filtres
                      </button>
                      
                      <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                        >
                          Grille
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                        >
                          Liste
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtres mobiles */}
                  {isFilterOpen && (
                    <div className="md:hidden space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                        <select
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="all">Toutes les catégories</option>
                          {categories.map((cat, index) => (
                            <option key={`${cat.value}-${index}`} value={cat.value}>
                              {cat.label} ({cat.count})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {/* Filtres desktop et status */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filtres :</span>
                      </div>
                      
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      >
                        <option value="all">Toutes les catégories</option>
                        {categories.map((cat, index) => (
                          <option key={`${cat.value}-${index}`} value={cat.value}>
                            {cat.label} ({cat.count})
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      >
                        {sortOptions.map(option => {
                          const Icon = option.icon
                          return (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          )
                        })}
                      </select>
                      
                      {(filters.category !== 'all' || filters.status !== 'all' || filters.search) && (
                        <button
                          onClick={resetFilters}
                          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {pagination.total} projet{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Status Filter Buttons améliorés */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['all', 'active', 'pending', 'completed'].map(status => {
                      const config = status === 'all' 
                        ? { label: 'Tous', color: 'text-gray-700', bgColor: 'bg-gray-100' }
                        : statusConfig[status]
                      
                      return (
                        <button
                          key={status}
                          onClick={() => handleFilterChange('status', status)}
                          className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${filters.status === status ? `${config.bgColor} border ${config.color} font-medium` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {status === 'active' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                          {status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                          {status === 'completed' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                          {config.label}
                          {status !== 'all' && (
                            <span className="text-xs opacity-75">
                              ({projects.filter(p => p.status === status).length})
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button
                          onClick={() => fetchProjects(pagination.page)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Réessayer le chargement
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Mode Grid (par défaut) */}
                {viewMode === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => {
                      const progress = calculateProgress(project.fundedAmount, project.fundingGoal)
                      const daysLeft = calculateDaysLeft(project.endDate)
                      const projectStatusConfig = statusConfig[project.status]
                      
                      return (
                        <div
                          key={project.id || project._id}
                          className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100"
                        >
                          {/* Project Image avec overlay */}
                          <div className="relative h-56 overflow-hidden">
                            {project.images && project.images.length > 0 ? (
                              <>
                                <img
                                  src={project.images[0]}
                                  alt={project.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 flex items-center justify-center">
                                <div className="text-5xl font-bold text-primary/30">
                                  {project.title.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                            
                            {/* Badges overlay */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full font-medium">
                                  {categoryLabels[project.category] || project.category}
                                </span>
                                {project.featured && (
                                  <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    En vedette
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            
                            {/* Project title overlay */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-xl font-bold text-white line-clamp-2">
                                {project.title}
                              </h3>
                            </div>
                          </div>
                          
                          {/* Project Content */}
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-gray-600">Par</span>
                                  <span className="font-medium">{project.creatorName}</span>
                                  {project.verified && (
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                                {project.location && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    {project.location}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                              {project.shortDescription || project.description?.substring(0, 120)}
                            </p>
                            
                            {/* Funding Progress Bar améliorée */}
                            <div className="mb-6">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency(project.fundedAmount, project.currency)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  sur {formatCurrency(project.fundingGoal, project.currency)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div 
                                  className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-1000"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {progress.toFixed(1)}% financé
                                </span>
                                <span className={`font-medium ${daysLeft <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {daysLeft > 0 ? `${daysLeft} jours restants` : 'Terminé'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                              <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <div className="text-lg font-bold text-gray-900">{project.backersCount}</div>
                                <div className="text-xs text-gray-500">Investisseurs</div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <div className="text-lg font-bold text-gray-900">
                                  {project.expectedROI ? `${project.expectedROI}%` : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">ROI estimé</div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <div className="text-lg font-bold text-gray-900">
                                  {project.minInvestment ? formatCurrency(project.minInvestment, project.currency) : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">Min. d'invest.</div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <Link
                                href={`/projects/${project.id || project._id}`}
                                className="flex-1 text-center border-2 border-primary text-primary hover:bg-primary/5 font-medium px-4 py-3 rounded-xl transition-all duration-300"
                              >
                                Voir détails
                              </Link>
                              
                              {project.status === 'active' ? (
                                <button
                                  onClick={() => handleContributeClick(project.id || project._id)}
                                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 font-medium px-4 py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                  Contribuer
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="flex-1 bg-gray-200 text-gray-500 font-medium px-4 py-3 rounded-xl cursor-not-allowed"
                                >
                                  {project.status === 'completed' ? 'Terminé' : 'Fermé'}
                                </button>
                              )}
                            </div>
                            
                            {/* Message invitant à se connecter */}
                            {!isAuthenticated && project.status === 'active' && (
                              <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500">
                                  🔐 Connectez-vous pour contribuer
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* View Mode Liste */
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const progress = calculateProgress(project.fundedAmount, project.fundingGoal)
                      const daysLeft = calculateDaysLeft(project.endDate)
                      const statusConfig = statusConfig[project.status]
                      
                      return (
                        <div
                          key={project.id || project._id}
                          className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Image dans le mode liste */}
                            <div className="md:w-48 flex-shrink-0">
                              <div className="relative h-48 md:h-full rounded-xl overflow-hidden">
                                {project.images && project.images.length > 0 ? (
                                  <img
                                    src={project.images[0]}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <div className="text-4xl font-bold text-primary/40">
                                      {project.title.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Contenu dans le mode liste */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-gray-600">Par {project.creatorName}</span>
                                    {project.verified && (
                                      <CheckCircle className="w-4 h-4 text-blue-500" />
                                    )}
                                    <span className={`text-xs px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                                      {statusConfig.label}
                                    </span>
                                    {project.featured && (
                                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        En vedette
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">
                                  {categoryLabels[project.category] || project.category}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {project.shortDescription || project.description?.substring(0, 200)}
                              </p>
                              
                              {/* Stats en ligne pour mode liste */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="space-y-1">
                                  <div className="text-lg font-bold">{formatCurrency(project.fundedAmount, project.currency)}</div>
                                  <div className="text-xs text-gray-500">Levés</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-lg font-bold">{project.backersCount}</div>
                                  <div className="text-xs text-gray-500">Investisseurs</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-lg font-bold">{progress.toFixed(1)}%</div>
                                  <div className="text-xs text-gray-500">Progress</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-lg font-bold">{daysLeft} jours</div>
                                  <div className="text-xs text-gray-500">Restants</div>
                                </div>
                              </div>
                              
                              {/* Progress bar dans le mode liste */}
                              <div className="mb-6">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                  <div 
                                    className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Objectif: {formatCurrency(project.fundingGoal, project.currency)}
                                  </span>
                                  <span className="font-medium text-primary">
                                    {formatCurrency(project.fundedAmount, project.currency)} levés
                                  </span>
                                </div>
                              </div>
                              
                              {/* Actions dans le mode liste */}
                              <div className="flex gap-3">
                                <Link
                                  href={`/projects/${project.id || project._id}`}
                                  className="flex-1 text-center border border-primary text-primary hover:bg-primary/5 font-medium px-4 py-3 rounded-xl"
                                >
                                  Voir détails
                                </Link>
                                
                                {project.status === 'active' ? (
                                  <button
                                    onClick={() => handleContributeClick(project.id || project._id)}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 font-medium px-4 py-3 rounded-xl"
                                  >
                                    Contribuer maintenant
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="flex-1 bg-gray-200 text-gray-500 font-medium px-4 py-3 rounded-xl cursor-not-allowed"
                                  >
                                    Contribution fermée
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Empty State amélioré */}
                {projects.length === 0 && !error && (
                  <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Filter className="w-10 h-10 text-primary/60" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Aucun projet trouvé
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                      {filters.search || filters.category !== 'all' || filters.status !== 'all'
                        ? "Aucun projet ne correspond à vos critères. Essayez d'élargir votre recherche ou de modifier vos filtres."
                        : "Il n'y a pas encore de projets publiés. Soyez le premier à lancer votre projet !"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {filters.search || filters.category !== 'all' || filters.status !== 'all' ? (
                        <button
                          onClick={resetFilters}
                          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium"
                        >
                          Réinitialiser les filtres
                        </button>
                      ) : (
                        <Link
                          href="/projects/new"
                          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 font-medium inline-flex items-center justify-center gap-2"
                        >
                          <ArrowRight className="w-5 h-5" />
                          Créer un projet
                        </Link>
                      )}
                      <Link
                        href="/projects"
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                      >
                        Voir tous les projets
                      </Link>
                    </div>
                  </div>
                )}

                {/* Pagination améliorée */}
                {pagination.pages > 1 && (
                  <div className="mt-12">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} sur {pagination.pages} • {pagination.total} projets
                      </div>
                      <nav className="inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-l-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Précédent
                        </button>
                        
                        {getPageRange().map((pageNumber, index) => (
                          pageNumber === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-4 py-3 bg-white border border-gray-300 text-gray-400">
                              ...
                            </span>
                          ) : (
                            <button
                              key={`page-${pageNumber}`}
                              onClick={() => handlePageChange(pageNumber as number)}
                              className={`px-4 py-3 border border-gray-300 ${
                                pagination.page === pageNumber
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-r-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          Suivant
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar améliorée */}
              <aside className="lg:col-span-1">
                <div className="space-y-6 sticky top-24">
                  {/* Featured Projects Card */}
                  {featuredProjects.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <Star className="w-5 h-5 text-purple-600" />
                          En vedette
                        </h4>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {featuredProjects.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {featuredProjects.map((project) => {
                          const progress = calculateProgress(project.fundedAmount, project.fundingGoal)
                          return (
                            <Link 
                              key={`featured-${project.id || project._id}`} 
                              href={`/projects/${project.id || project._id}`}
                              className="group block"
                            >
                              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="relative w-14 h-14 flex-shrink-0">
                                  {project.images && project.images.length > 0 ? (
                                    <img
                                      src={project.images[0]}
                                      alt={project.title}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                      <span className="text-primary font-bold text-sm">
                                        {project.title.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium group-hover:text-primary truncate">
                                    {project.title}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {formatCompactCurrency(project.fundedAmount)} levés
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div 
                                      className="bg-primary h-1.5 rounded-full"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent Projects Card */}
                  {recentProjects.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Récemment ajoutés
                        </h4>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {recentProjects.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {recentProjects.map((project) => (
                          <Link 
                            key={`recent-${project.id || project._id}`} 
                            href={`/projects/${project.id || project._id}`}
                            className="group block"
                          >
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">
                                  {project.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium group-hover:text-primary truncate">
                                  {project.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {categoryLabels[project.category]?.split(' ')[1] || project.category}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories Card */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-lg mb-4">Catégories</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleFilterChange('category', 'all')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                          filters.category === 'all'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">Toutes catégories</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {pagination.total}
                        </span>
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={`cat-${cat.value}`}
                          onClick={() => handleFilterChange('category', cat.value)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                            filters.category === cat.value
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm">{cat.label}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {cat.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats Card */}
                  <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-5 text-white">
                    <h4 className="font-bold text-lg mb-4">Statistiques globales</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-white/20">
                        <span className="text-sm opacity-90">Projets actifs</span>
                        <span className="font-bold">{stats.activeProjects}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/20">
                        <span className="text-sm opacity-90">Total levé</span>
                        <span className="font-bold">{formatCompactCurrency(stats.totalRaised)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">Taux de succès</span>
                        <span className="font-bold">{stats.successRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Create Project */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-5">
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mb-3">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-orange-900 text-lg mb-2">Vous avez un projet ?</h4>
                      <p className="text-sm text-orange-800">
                        Lancez votre projet sur UmojaFund et transformez vos idées en réalité
                      </p>
                    </div>
                    <Link
                      href="/projects/new"
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                      Créer un projet
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {/* CTA pour se connecter si non authentifié */}
                  {!isAuthenticated && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                      <div className="mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-blue-900 text-lg mb-2">Rejoignez-nous !</h4>
                        <p className="text-sm text-blue-800">
                          Créez un compte pour contribuer aux projets et suivre vos investissements
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Link
                          href="/auth/login"
                          className="w-full inline-flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700"
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/auth/register"
                          className="w-full inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-50"
                        >
                          Créer un compte
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}