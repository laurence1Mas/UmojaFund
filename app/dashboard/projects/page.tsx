"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Clock, TrendingUp, Target, Loader2, PlusCircle } from "lucide-react"
import { useApi } from "@/lib/hooks/useApi"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  description: string
  shortDescription?: string
  category: string
  invested: number
  status: 'active' | 'completed' | 'pending' | 'draft' | 'funded' | 'cancelled'
  image?: string
  images?: string[]
  progress: number
  returns: number
  fundedAmount: number
  fundingGoal: number
  endDate: string
  startDate?: string
  expectedROI?: number
  minInvestment?: number
  createdAt: string
  updatedAt: string
}

export default function MyProjects() {
  const { fetchApi, isLoading } = useApi()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserProjects()
  }, [filter])

  const loadUserProjects = async () => {
    try {
      setIsLoadingData(true)
      setError(null)
      
      const endpoint = `/projects/user?limit=10&status=${filter === 'all' ? '' : filter}`
      
      const response = await fetchApi(endpoint)

      if (response.success && Array.isArray(response.data?.projects)) {
        const apiProjects = response.data.projects
        
        const formattedProjects = apiProjects.map((project: any) => ({
          _id: project.id || project._id,
          title: project.title,
          description: project.description || project.shortDescription || '',
          shortDescription: project.shortDescription,
          category: project.category,
          invested: project.userInvestment?.amount || 0,
          status: project.status || 'pending',
          image: project.image || project.images?.[0],
          images: project.images,
          progress: project.progress || 0,
          returns: project.userInvestment?.returns || 0,
          fundedAmount: project.fundedAmount || 0,
          fundingGoal: project.fundingGoal || 0,
          endDate: project.endDate || new Date().toISOString(),
          startDate: project.startDate,
          expectedROI: project.expectedROI,
          minInvestment: project.minInvestment,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }))
        
        setProjects(formattedProjects)
      } else {
        setProjects([])
        if (response.error) {
          setError(response.error)
        }
      }
      
    } catch (error: any) {
      console.error('Error loading projects:', error)
      setError(error.message || 'Erreur lors du chargement des projets')
      setProjects([])
    } finally {
      setIsLoadingData(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'funded': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const calculateROI = (invested: number, returns: number) => {
    if (invested === 0) return '0.0'
    return ((returns / invested) * 100).toFixed(1)
  }

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // Calcul des statistiques
  const totalInvested = projects.reduce((sum, p) => sum + p.invested, 0)
  const totalReturns = projects.reduce((sum, p) => sum + p.returns, 0)
  const activeProjectsCount = projects.filter(p => p.status === 'active').length

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos projets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header avec bouton pour créer un projet */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600">Projets que vous financez ou suivez</p>
        </div>
        
        <div className="flex gap-3">
          <Link
            href="/projects/new"
            className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <PlusCircle size={20} />
            Créer un projet
          </Link>
          
          <Link
            href="/projects"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            Explorer les projets
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous les projets
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Actifs
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Terminés
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          En attente
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Investi</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalInvested)} €
              </p>
              <p className="text-xs text-gray-500 mt-1">Sur {projects.length} projets</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Retours Totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                +{formatCurrency(totalReturns)} €
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ROI moyen: {totalInvested > 0 ? calculateROI(totalInvested, totalReturns) : '0'}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Projets Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProjectsCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">En cours de financement</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <button
                onClick={loadUserProjects}
                className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="space-y-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Project Image */}
                <div className="lg:w-48 lg:h-48 flex-shrink-0">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 lg:h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 lg:h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <div className="text-4xl font-bold text-primary/50">
                        {project.title.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {formatStatus(project.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {project.shortDescription || project.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Votre Investissement</p>
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(project.invested)} €
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Retours</p>
                        <p className="text-lg font-bold text-green-600">
                          +{formatCurrency(project.returns)} €
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progrès: {project.progress.toFixed(1)}%</span>
                      <span>{formatCurrency(project.fundedAmount)} / {formatCurrency(project.fundingGoal)} €</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, project.progress)}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Catégorie</p>
                      <p className="font-medium">{project.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de fin</p>
                      <p className="font-medium">{formatDate(project.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ROI</p>
                      <p className="font-medium text-green-600">
                        +{calculateROI(project.invested, project.returns)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jours restants</p>
                      <p className="font-medium">{calculateDaysLeft(project.endDate)} jours</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/projects/${project._id}`}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
                    >
                      Voir les détails <ArrowRight size={16} />
                    </Link>
                    
                    {project.status === 'active' && (
                      <Link
                        href={`/projects/${project._id}/invest`}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                      >
                        Contribuer
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        // Logique pour mettre à jour l'investissement
                        console.log('Mettre à jour', project._id)
                      }}
                      className="bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Mettre à jour
                    </button>
                    
                    <Link
                      href={`/projects/${project._id}/reports`}
                      className="bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Rapports
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "Vous n'avez pas encore investi dans de projets." 
                : `Vous n'avez pas de projets ${filter}.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Explorer les projets
              </Link>
              <Link
                href="/projects/new"
                className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors font-medium border border-secondary"
              >
                Créer votre premier projet
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bouton flottant pour créer un projet (mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Link
          href="/projects/new"
          className="bg-secondary hover:bg-secondary/90 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        >
          <PlusCircle size={24} />
        </Link>
      </div>
    </div>
  )
}