"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Search, Filter, Clock, Users, TrendingUp, DollarSign, Eye, CheckCircle, ChevronLeft, ChevronRight, Heart } from "lucide-react"
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
}

interface ProjectFilters {
  category: string
  status: string
  search: string
  sortBy: 'createdAt' | 'fundingGoal' | 'fundedAmount' | 'backersCount'
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
  'environment': 'Environnement',
  'education': 'Éducation',
  'technology': 'Technologie',
  'health': 'Santé',
  'agriculture': 'Agriculture',
  'energy': 'Énergie',
  'community': 'Communauté',
  'arts': 'Arts & Culture',
  'other': 'Autre'
}

const statusLabels: Record<string, string> = {
  'active': 'Actif',
  'pending': 'En attente',
  'draft': 'Brouillon',
  'completed': 'Terminé',
  'cancelled': 'Annulé',
  'failed': 'Échoué'
}

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
    
    return { activeProjects, totalRaised, totalBackers }
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

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <section className="bg-primary text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Explorer les projets</h1>
              <p className="text-xl text-blue-100">Découvrez des projets innovants qui font la différence</p>
            </div>
          </section>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explorer les projets</h1>
            <p className="text-xl text-blue-100 mb-8">
              Découvrez des projets innovants qui transforment des vies et créent un impact positif
            </p>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pagination.total}</div>
                    <div className="text-sm text-blue-100">Projets au total</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</div>
                    <div className="text-sm text-blue-100">Levés au total</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalBackers}</div>
                    <div className="text-sm text-blue-100">Investisseurs</div>
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
                {/* Search and Filters Bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un projet..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Category Filter - CORRECTION ICI */}
                    <div>
                      <select
  value={filters.category}
  onChange={(e) => handleFilterChange('category', e.target.value)}
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
>
  <option key="all" value="all">Toutes les catégories</option>
  {categories.map(cat => (
    <option key={cat.value} value={cat.value}>
      {`${cat.label} (${cat.count})`}
    </option>
  ))}
</select>
                    </div>

                    {/* Sort - CORRECTION ICI */}
                    <div>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option key="createdAt" value="createdAt">Plus récents</option>
                        <option key="fundedAmount" value="fundedAmount">Plus financés</option>
                        <option key="backersCount" value="backersCount">Plus populaires</option>
                        <option key="fundingGoal" value="fundingGoal">Montant élevé</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      key="all"
                      onClick={() => handleFilterChange('status', 'all')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filters.status === 'all'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      key="active"
                      onClick={() => handleFilterChange('status', 'active')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filters.status === 'active'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Actifs
                    </button>
                    <button
                      key="pending"
                      onClick={() => handleFilterChange('status', 'pending')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filters.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      En attente
                    </button>
                    <button
                      key="completed"
                      onClick={() => handleFilterChange('status', 'completed')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filters.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Terminés
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                    <button
                      onClick={() => fetchProjects(pagination.page)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Réessayer
                    </button>
                  </div>
                )}

                {/* Projects Count */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Affichage de {projects.length} projet{projects.length > 1 ? 's' : ''} sur {pagination.total}
                  </div>
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} sur {pagination.pages}
                  </div>
                </div>

                {/* Projects Grid - Style original */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => {
                    const progress = calculateProgress(project.fundedAmount, project.fundingGoal)
                    const daysLeft = calculateDaysLeft(project.endDate)
                    
                    return (
                      <div
                        key={project.id || project._id}
                        className="bg-white rounded-lg overflow-hidden shadow-sm transform transition duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]"
                      >
                        {/* Project Image */}
                        <div className="relative h-48">
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
                          
                          {/* Badges overlay */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span key="category" className="text-xs bg-secondary/10 text-primary px-3 py-1 rounded-full">
                              {categoryLabels[project.category] || project.category}
                            </span>
                            {project.featured && (
                              <span key="featured" className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                En vedette
                              </span>
                            )}
                          </div>
                          
                          {/* Status badge */}
                          <span key="status" className="absolute top-3 right-3 text-xs bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            {statusLabels[project.status]}
                          </span>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold flex-1">{project.title}</h3>
                            {project.verified && (
                              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">par {project.creatorName}</p>
                          
                          {/* Funding Progress */}
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(project.fundedAmount, project.currency)} sur {formatCurrency(project.fundingGoal, project.currency)}
                            </p>
                          </div>
                          
                          {/* Project Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                            <div key="backers" className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{project.backersCount} investisseurs</span>
                            </div>
                            <div key="days" className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{daysLeft > 0 ? `${daysLeft} jours` : 'Terminé'}</span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Link
                              href={`/projects/${project.id || project._id}`}
                              className="flex-1 text-primary font-medium hover:text-primary/80 transition-colors inline-flex items-center justify-center gap-2 border border-primary px-4 py-2 rounded-lg"
                            >
                              <Eye size={16} />
                              Voir détails
                            </Link>
                            
                            {/* Bouton Contribuer - accessible à tous */}
                            {project.status === 'active' ? (
                              <button
                                key="contribute"
                                onClick={() => handleContributeClick(project.id || project._id)}
                                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
                              >
                                <Heart size={16} />
                                Contribuer
                              </button>
                            ) : (
                              <button
                                key="disabled"
                                disabled
                                className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed inline-flex items-center justify-center gap-2"
                              >
                                <Heart size={16} />
                                {project.status === 'completed' ? 'Projet terminé' : 'Contribution fermée'}
                              </button>
                            )}
                          </div>
                          
                          {/* Message invitant à se connecter si non authentifié */}
                          {!isAuthenticated && project.status === 'active' && (
                            <div key="login-message" className="mt-3 text-center">
                              <p className="text-xs text-gray-500">
                                Vous devrez vous connecter pour finaliser votre contribution
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Empty State */}
                {projects.length === 0 && !error && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun projet trouvé
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      {filters.search || filters.category !== 'all' || filters.status !== 'all'
                        ? "Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                        : "Il n'y a pas encore de projets publiés. Soyez le premier à créer un projet !"}
                    </p>
                    {(!filters.search && filters.category === 'all' && filters.status === 'all') && (
                      <Link
                        href="/projects/new"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
                      >
                        Créer un projet
                      </Link>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-10 flex items-center justify-center">
                    <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        key="prev"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-white border text-sm text-gray-700 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Préc
                      </button>
                      
                      {getPageRange().map((pageNumber, index) => (
                        pageNumber === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-4 py-2 bg-white border text-sm text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${pageNumber}`}
                            onClick={() => handlePageChange(pageNumber as number)}
                            className={`px-4 py-2 bg-white border text-sm ${
                              pagination.page === pageNumber
                                ? 'bg-primary text-white border-primary'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      ))}
                      
                      <button
                        key="next"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 bg-white border text-sm text-gray-700 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suiv
                      </button>
                    </nav>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Featured Projects */}
                  {featuredProjects.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        Projets en vedette
                      </h4>
                      <div className="space-y-3">
                        {featuredProjects.map((project) => (
                          <Link key={`featured-${project.id || project._id}`} href={`/projects/${project.id || project._id}`} className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-sm">
                                {project.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium group-hover:text-primary">
                                {project.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(project.fundedAmount, project.currency)} levés
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Projects */}
                  {recentProjects.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Projets récents
                      </h4>
                      <div className="space-y-3">
                        {recentProjects.map((project) => (
                          <Link key={`recent-${project.id || project._id}`} href={`/projects/${project.id || project._id}`} className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-sm">
                                {project.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium group-hover:text-primary">
                                {project.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {categoryLabels[project.category] || project.category}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-3">Catégories</h4>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <button
                          key={`cat-${cat.value}`}
                          onClick={() => handleFilterChange('category', cat.value)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            filters.category === cat.value
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm capitalize">{cat.label}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {cat.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-5 text-white">
                    <h4 className="font-semibold mb-4">Statistiques rapides</h4>
                    <div className="space-y-3">
                      <div key="projects-displayed" className="flex items-center justify-between">
                        <span className="text-sm opacity-90">Projets affichés</span>
                        <span className="font-bold">{projects.length}</span>
                      </div>
                      <div key="current-page" className="flex items-center justify-between">
                        <span className="text-sm opacity-90">Page actuelle</span>
                        <span className="font-bold">{pagination.page}/{pagination.pages}</span>
                      </div>
                      <div key="total-projects" className="flex items-center justify-between">
                        <span className="text-sm opacity-90">Total projets</span>
                        <span className="font-bold">{pagination.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Create Project */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-lg p-5">
                    <h4 className="font-semibold text-orange-900 mb-3">Vous avez un projet ?</h4>
                    <p className="text-sm text-orange-800 mb-4">
                      Lancez votre projet sur UmojaFund et transformez vos idées en réalité
                    </p>
                    <Link
                      href="/projects/new"
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90"
                    >
                      Créer un projet
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {/* CTA pour se connecter si non authentifié */}
                  {!isAuthenticated && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-5">
                      <h4 className="font-semibold text-blue-900 mb-3">Connectez-vous</h4>
                      <p className="text-sm text-blue-800 mb-4">
                        Créez un compte pour contribuer aux projets et suivre vos investissements
                      </p>
                      <div className="space-y-2">
                        <Link
                          href="/auth/login"
                          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700"
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/auth/register"
                          className="w-full inline-flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-50"
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