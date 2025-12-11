"use client"

import { useState, useEffect } from "react"
import { 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Target, 
  Loader2, 
  PlusCircle, 
  Users,
  BarChart3,
  DollarSign,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  PieChart
} from "lucide-react"
import { useApi } from "@/lib/hooks/useApi"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"
import Image from "next/image"

interface Project {
  id: string
  _id: string
  title: string
  description: string
  shortDescription?: string
  category: string
  userRole: 'creator' | 'contributor' | 'investor'
  status: 'active' | 'completed' | 'pending' | 'draft' | 'cancelled' | 'published'
  images?: string[]
  progress: number
  fundedAmount: number
  fundingGoal: number
  endDate: string
  startDate?: string
  expectedROI?: number
  minInvestment?: number
  createdAt: string
  updatedAt: string
  verified?: boolean
  featured?: boolean
  creatorName?: string
  creatorId?: string
  
  // User contribution data
  userContribution?: {
    totalAmount: number
    contributionsCount: number
    firstContributionDate: string
    lastContributionDate: string
    expectedReturns: number
    roi: string
  } | null
  
  // For backward compatibility
  userInvestment?: {
    amount: number
    returns: number
    roi: string
  } | null
}

interface PortfolioSummary {
  totalContributed: number
  totalExpectedReturns: number
  activeProjects: number
  completedProjects: number
  totalContributions: number
  asCreator: number
  asContributor: number
}

export default function MyProjects() {
  const { fetchApi } = useApi()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalContributed: 0,
    totalExpectedReturns: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalContributions: 0,
    asCreator: 0,
    asContributor: 0
  })
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'draft' | 'contributor' | 'creator'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'roi' | 'progress'>('date')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalReturns: 0,
    activeCount: 0,
    completedCount: 0,
    averageROI: 0
  })

  useEffect(() => {
    loadUserProjects()
  }, [filter, sortBy])

  const loadUserProjects = async () => {
    try {
      setIsLoadingData(true)
      setError(null)
      
      const endpoint = `/projects/user?limit=20&status=${filter === 'all' ? '' : filter}`
      
      const response = await fetchApi(endpoint)

      if (response.success && response.data) {
        const apiProjects = response.data.projects || []
        const summary = response.data.summary || {}
        
        console.log("📊 Projects data received:", {
          count: apiProjects.length,
          summary,
          sample: apiProjects[0]
        })
        
        // Formater les projets
        const formattedProjects = apiProjects.map((project: any) => {
          // Récupérer le montant de la contribution utilisateur
          const contributionAmount = project.userContribution?.totalAmount || 
                                   project.userInvestment?.amount || 0
          
          // Récupérer les retours
          const returns = project.userContribution?.expectedReturns || 
                         project.userInvestment?.returns || 0
          
          // Calculer le ROI
          const roiPercent = project.userContribution?.roi || 
                           project.userInvestment?.roi || 
                           `${(project.expectedROI || 0).toFixed(1)}%`
          
          return {
            id: project.id || project._id,
            _id: project.id || project._id,
            title: project.title || 'Sans titre',
            description: project.description || '',
            shortDescription: project.shortDescription,
            category: project.category || 'other',
            userRole: project.userRole || (contributionAmount > 0 ? 'contributor' : 'creator'),
            status: project.status || 'draft',
            images: project.images || [],
            progress: project.progress || 0,
            fundedAmount: project.fundedAmount || 0,
            fundingGoal: project.fundingGoal || 0,
            endDate: project.endDate || new Date().toISOString(),
            startDate: project.startDate,
            expectedROI: project.expectedROI || 0,
            minInvestment: project.minInvestment || 0,
            createdAt: project.createdAt || new Date().toISOString(),
            updatedAt: project.updatedAt || new Date().toISOString(),
            verified: project.verified || false,
            featured: project.featured || false,
            creatorName: project.creatorName || 'Inconnu',
            creatorId: project.creatorId,
            
            // Données de contribution
            userContribution: contributionAmount > 0 ? {
              totalAmount: contributionAmount,
              contributionsCount: project.userContribution?.contributionsCount || 1,
              firstContributionDate: project.userContribution?.firstContributionDate || project.createdAt,
              lastContributionDate: project.userContribution?.lastContributionDate || project.createdAt,
              expectedReturns: returns,
              roi: roiPercent
            } : null,
            
            // Pour compatibilité
            userInvestment: contributionAmount > 0 ? {
              amount: contributionAmount,
              returns: returns,
              roi: roiPercent
            } : null
          }
        })
        
        setProjects(formattedProjects)
        setPortfolioSummary(summary)
        
        // Calculer les statistiques détaillées
        calculateDetailedStats(formattedProjects)
        
      } else {
        setProjects([])
        if (response.error) {
          setError(response.error)
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error loading projects:', error)
      setError(error.message || 'Erreur lors du chargement des projets')
      setProjects([])
    } finally {
      setIsLoadingData(false)
    }
  }

  const calculateDetailedStats = (projectsList: Project[]) => {
    const invested = projectsList.reduce((sum, p) => 
      sum + (p.userContribution?.totalAmount || p.userInvestment?.amount || 0), 0)
    
    const returns = projectsList.reduce((sum, p) => 
      sum + (p.userContribution?.expectedReturns || p.userInvestment?.returns || 0), 0)
    
    const active = projectsList.filter(p => p.status === 'active').length
    const completed = projectsList.filter(p => p.status === 'completed').length
    
    const roi = invested > 0 ? ((returns / invested) * 100) : 0
    
    setStats({
      totalInvested: invested,
      totalReturns: returns,
      activeCount: active,
      completedCount: completed,
      averageROI: roi
    })
  }

  const sortProjects = (projectsList: Project[]) => {
    return [...projectsList].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          const amountA = a.userContribution?.totalAmount || a.userInvestment?.amount || 0
          const amountB = b.userContribution?.totalAmount || b.userInvestment?.amount || 0
          return amountB - amountA
          
        case 'roi':
          const roiA = parseFloat(a.userContribution?.roi?.replace('%', '') || a.userInvestment?.roi?.replace('%', '') || '0')
          const roiB = parseFloat(b.userContribution?.roi?.replace('%', '') || b.userInvestment?.roi?.replace('%', '') || '0')
          return roiB - roiA
          
        case 'progress':
          return b.progress - a.progress
          
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    if (filter === 'contributor') return project.userRole === 'contributor'
    if (filter === 'creator') return project.userRole === 'creator'
    return project.status === filter
  })

  const sortedProjects = sortProjects(filteredProjects)

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'published': return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getRoleColor = (role: Project['userRole']) => {
    switch (role) {
      case 'creator': return 'bg-indigo-100 text-indigo-800 border border-indigo-200'
      case 'contributor': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Actif',
      'completed': 'Terminé',
      'published': 'Publié',
      'pending': 'En attente',
      'draft': 'Brouillon',
      'cancelled': 'Annulé'
    }
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'creator': 'Créateur',
      'contributor': 'Contributeur',
      'investor': 'Investisseur'
    }
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, compact: boolean = false) => {
    if (!amount && amount !== 0) return "0"
    
    if (compact) {
      return new Intl.NumberFormat('fr-FR', {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }).format(amount)
    }
    
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getDaysLeftColor = (days: number) => {
    if (days <= 7) return 'text-red-600 bg-red-50'
    if (days <= 30) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <div className="absolute inset-0 border-4 border-t-primary/30 border-r-transparent border-b-transparent border-l-transparent rounded-full"></div>
        </div>
        <p className="text-gray-600 mt-4">Chargement de vos projets...</p>
        <p className="text-sm text-gray-500 mt-2">Cela peut prendre quelques secondes</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Mes Projets & Contributions
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos projets et suivez vos contributions
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
          >
            <Eye size={18} />
            Explorer les projets
          </Link>
          
          <Link
            href="/projects/new"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-sm"
          >
            <PlusCircle size={18} />
            Créer un projet
          </Link>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Contribué</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalInvested)} ADA
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {projects.length} projet{projects.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {portfolioSummary.totalContributions} contribution{portfolioSummary.totalContributions !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Retours Attendus</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                +{formatCurrency(stats.totalReturns)} ADA
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`text-xs ${stats.averageROI > 0 ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-100'} px-2 py-1 rounded-full`}>
                  ROI moyen: {stats.averageROI.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Projets Actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.activeCount}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                En cours de financement
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Projets Terminés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.completedCount}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                Avec retour sur contribution
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Résumé détaillé */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de votre portefeuille</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En tant que Créateur</p>
                <p className="text-xl font-bold text-gray-900">
                  {portfolioSummary.asCreator || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <PieChart className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En tant que Contributeur</p>
                <p className="text-xl font-bold text-gray-900">
                  {portfolioSummary.asContributor || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Retours Attendus</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(portfolioSummary.totalExpectedReturns || 0)} ADA
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contributions Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {portfolioSummary.totalContributions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              filter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('creator')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              filter === 'creator'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes Projets
          </button>
          <button
            onClick={() => setFilter('contributor')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              filter === 'contributor'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes Contributions
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              filter === 'active'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Actifs
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              filter === 'completed'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Terminés
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            Trier par:
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="date">Date récente</option>
            <option value="amount">Montant</option>
            <option value="roi">ROI</option>
            <option value="progress">Progression</option>
          </select>
          
          <button
            onClick={loadUserProjects}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Erreur de chargement</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadUserProjects}
              className="text-red-700 hover:text-red-800 text-sm font-medium mt-2"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="space-y-6">
        {sortedProjects.length > 0 ? (
          sortedProjects.map((project) => {
            const contribution = project.userContribution || project.userInvestment
            const daysLeft = calculateDaysLeft(project.endDate)
            const isContributor = project.userRole === 'contributor'
            const isCreator = project.userRole === 'creator'
            
            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Project Image */}
                    <div className="lg:w-48 lg:h-48 flex-shrink-0 relative">
                      <div className="w-full h-48 lg:h-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
                        {project.images && project.images.length > 0 ? (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-5xl font-bold text-primary/30">
                              {project.title.charAt(0)}
                            </div>
                          </div>
                        )}
                        
                        {/* Badge de rôle */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getRoleColor(project.userRole)}`}>
                            {formatRole(project.userRole)}
                          </span>
                        </div>
                        
                        {/* Badge de statut */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {formatStatus(project.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {project.title}
                            </h3>
                            {project.verified && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                Vérifié
                              </span>
                            )}
                            {project.featured && (
                              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
                                En vedette
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {project.shortDescription || project.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Créé le {formatDate(project.createdAt)}
                            </span>
                            {project.creatorName && (
                              <span>• Par {project.creatorName}</span>
                            )}
                            <span>• {project.category}</span>
                          </div>
                        </div>
                        
                        {/* Contribution/Investment Details */}
                        {contribution && (
                          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-1">Votre Contribution</p>
                              <p className="text-2xl font-bold text-primary mb-1">
                                {formatCurrency(contribution.totalAmount)} ADA
                              </p>
                              {contribution.contributionsCount > 1 && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {contribution.contributionsCount} contribution{contribution.contributionsCount > 1 ? 's' : ''}
                                </p>
                              )}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Retours attendus:</span>
                                  <span className="font-bold text-green-600">
                                    +{formatCurrency(contribution.expectedReturns)} ADA
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">ROI:</span>
                                  <span className="font-bold text-green-600">
                                    {contribution.roi}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <span>Progression du financement</span>
                            <span className="font-bold text-gray-900">{project.progress.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDaysLeftColor(daysLeft)}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {daysLeft} jour{daysLeft !== 1 ? 's' : ''}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(project.fundedAmount)} / {formatCurrency(project.fundingGoal)} ADA
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                            style={{ width: `${Math.min(100, project.progress)}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">ROI attendu</p>
                          <p className="font-bold text-green-600">
                            {project.expectedROI ? `+${project.expectedROI}%` : 'N/A'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Investissement min</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(project.minInvestment || 0)} ADA
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Contributeurs</p>
                          <p className="font-bold text-gray-900">
                            {project.creatorName || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Dernière mise à jour</p>
                          <p className="font-bold text-gray-900">
                            {formatDate(project.updatedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 text-sm"
                        >
                          <Eye size={16} />
                          Voir les détails
                        </Link>
                        
                        {isCreator && (
                          <Link
                            href={`/projects/${project.id}/edit`}
                            className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 text-sm"
                          >
                            ✏️ Modifier
                          </Link>
                        )}
                        
                        {project.status === 'active' && isContributor && (
                          <Link
                            href={`/projects/${project.id}/contribute`}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm"
                          >
                            🔄 Contribuer à nouveau
                          </Link>
                        )}
                        
                        {contribution && (
                          <Link
                            href={`/dashboard/contributions?project=${project.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm"
                          >
                            📊 Voir mes contributions
                          </Link>
                        )}
                        
                        <Link
                          href={`/projects/${project.id}/updates`}
                          className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                          📰 Mises à jour
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              {filter === 'creator' ? (
                <PlusCircle className="w-10 h-10 text-gray-400" />
              ) : filter === 'contributor' ? (
                <Target className="w-10 h-10 text-gray-400" />
              ) : (
                <TrendingDown className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {filter === 'all' ? "Aucun projet trouvé" :
               filter === 'creator' ? "Aucun projet créé" :
               filter === 'contributor' ? "Aucune contribution" :
               `Aucun projet ${formatStatus(filter)}`}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'creator' 
                ? "Commencez par créer votre premier projet pour collecter des fonds."
                : filter === 'contributor'
                ? "Explorez les projets actifs et faites votre première contribution."
                : "Découvrez de nouvelles opportunités d'investissement ou créez votre propre projet."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
              >
                Explorer les projets
              </Link>
              <Link
                href="/projects/new"
                className="bg-white border border-primary text-primary hover:bg-primary/5 px-8 py-3 rounded-lg font-medium"
              >
                Créer un projet
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bouton flottant pour créer un projet (mobile) */}
      <div className="fixed bottom-8 right-8 md:hidden z-10">
        <Link
          href="/projects/new"
          className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-primary/30"
        >
          <PlusCircle size={24} />
        </Link>
      </div>
    </div>
  )
}