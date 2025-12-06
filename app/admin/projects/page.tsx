"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowUpDown,
  RefreshCw,
  Shield,
  BarChart3
} from "lucide-react"
import { useApi } from "@/lib/hooks/useApi"
import { useAuth } from "@/lib/contexts/AuthContext"

interface Project {
  id: string
  _id: string
  title: string
  shortDescription: string
  category: string
  creatorName: string
  fundingGoal: number
  fundedAmount: number
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'failed' | 'rejected'
  createdAt: string
  updatedAt: string
  verified: boolean
  backersCount: number
  // Champs additionnels du modèle
  startDate?: string
  endDate?: string
  currency?: string
  featured?: boolean
}

// Dans les options de statut
const statusOptions = [
  { value: 'all', label: 'Tous les statuts', color: 'bg-gray-100 text-gray-800' },
  { value: 'draft', label: 'Brouillons', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'active', label: 'Actifs', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Terminés', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Annulés', color: 'bg-red-100 text-red-800' },
  { value: 'failed', label: 'Échoués', color: 'bg-red-100 text-red-800' },
  { value: 'rejected', label: 'Rejetés', color: 'bg-red-100 text-red-800' }
]



export default function AdminProjectsPage() {
  const { fetchApi, isLoading } = useApi()
  const { user } = useAuth()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts', color: 'bg-gray-100 text-gray-800' },
    { value: 'draft', label: 'Brouillons', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'active', label: 'Actifs', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Terminés', color: 'bg-blue-100 text-blue-800' },
    { value: 'cancelled', label: 'Annulés', color: 'bg-red-100 text-red-800' },
    { value: 'rejected', label: 'Rejetés', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterAndSortProjects()
  }, [projects, statusFilter, searchQuery, sortBy, sortOrder])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetchApi('/admin/projects', {
        requiresAuth: true
      })
      
      if (response.success && Array.isArray(response.data?.projects)) {
        setProjects(response.data.projects)
      } else {
        // Fallback: utiliser l'endpoint normal si admin n'existe pas
        const allProjects = await fetchApi('/projects', {
          requiresAuth: true
        })
        
        if (allProjects.success && Array.isArray(allProjects.data)) {
          setProjects(allProjects.data)
        } else {
          setError("Impossible de charger les projets")
        }
      }
    } catch (err: any) {
      console.error("Error fetching projects:", err)
      setError(err.message || "Erreur lors du chargement des projets")
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProjects = () => {
    let filtered = [...projects]

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.shortDescription.toLowerCase().includes(query) ||
        project.creatorName.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query)
      )
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Project]
      let bValue: any = b[sortBy as keyof Project]

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProjects(filtered)
  }

  const handleStatusChange = async (projectId: string, newStatus: string, reason?: string) => {
  try {
    console.log('Changing status for project:', projectId, 'to:', newStatus)
    
    // Vérifier si c'est un ID mock
    const isMockId = projectId.startsWith('mock-')
    
    let url = ''
    let method = 'POST'
    let body: any = {}
    
    if (newStatus === 'active') {
      // Pour approuver un projet
      url = `/projects/${projectId}/approve`
      body = {
        reviewedBy: user?.name,
        notes: reason || ''
      }
    } else {
      // Pour d'autres changements de statut
      url = `/admin/projects/${projectId}/status`
      method = 'PUT'
      body = { 
        status: newStatus,
        reason: reason || '',
        reviewedBy: user?.name,
        reviewedAt: new Date().toISOString()
      }
    }
    
    console.log('Making request to:', url, 'with method:', method)

    const response = await fetchApi(url, {
      method: method,
      body: body,
      requiresAuth: true
    })

    console.log('Response:', response)

    if (response.success) {
      // Mettre à jour l'état local
      setProjects(prev => prev.map(project => 
        project.id === projectId || project._id === projectId
          ? { 
              ...project, 
              status: newStatus as any, 
              updatedAt: new Date().toISOString(),
              verified: newStatus === 'active'
            }
          : project
      ))
      
      // Feedback utilisateur
      alert(`Projet ${newStatus === 'active' ? 'approuvé' : 'mis à jour'} avec succès`)
    } else {
      let errorMessage = response.error || 'Action échouée'
      
      // Afficher les erreurs de validation si présentes
      if (response.validationErrors) {
        errorMessage += '\n' + response.validationErrors.join('\n')
      }
      
      alert(`Erreur: ${errorMessage}`)
    }
  } catch (err: any) {
    console.error("Error updating project status:", err)
    alert(`Erreur: ${err.message || 'Une erreur est survenue'}`)
  }
}

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProjects.length === 0) {
      alert("Veuillez sélectionner une action et des projets")
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir ${bulkAction} ${selectedProjects.length} projet(s) ?`)) {
      return
    }

    try {
      const response = await fetchApi('/admin/projects/bulk', {
        method: 'PUT',
        body: {
          projectIds: selectedProjects,
          action: bulkAction,
          reason: `Action groupée par ${user?.name}`
        },
        requiresAuth: true
      })

      if (response.success) {
        // Mettre à jour l'état local
        setProjects(prev => prev.map(project => 
          selectedProjects.includes(project.id) || selectedProjects.includes(project._id)
            ? { 
                ...project, 
                status: bulkAction as any, 
                updatedAt: new Date().toISOString(),
                verified: bulkAction === 'active'
              }
            : project
        ))
        setSelectedProjects([])
        setBulkAction('')
        alert(`${selectedProjects.length} projet(s) mis à jour avec succès`)
      } else {
        alert(`Erreur: ${response.error}`)
      }
    } catch (err: any) {
      alert(`Erreur: ${err.message}`)
    }
  }

  const toggleSelectProject = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id || p._id))
    }
  }

  const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
    case 'draft': return <AlertCircle className="w-4 h-4 text-gray-500" />
    case 'completed': return <TrendingUp className="w-4 h-4 text-blue-500" />
    case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
    case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
    case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />
    default: return <AlertCircle className="w-4 h-4 text-gray-500" />
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration des projets</h1>
              <p className="text-gray-600">Gérez et modérez les projets soumis par les utilisateurs</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProjects}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total projets</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Brouillons</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'draft').length}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, description ou créateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="createdAt">Date de création</option>
                <option value="updatedAt">Date de modification</option>
                <option value="title">Titre</option>
                <option value="fundingGoal">Montant</option>
                <option value="backersCount">Investisseurs</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProjects.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    {selectedProjects.length} projet(s) sélectionné(s)
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Action groupée...</option>
                    <option value="active">Approuver</option>
                    <option value="pending">Mettre en attente</option>
                    <option value="rejected">Rejeter</option>
                    <option value="cancelled">Annuler</option>
                  </select>
                  
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    Appliquer
                  </button>
                  
                  <button
                    onClick={() => setSelectedProjects([])}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Projet
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Créateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {currentProjects.map((project) => (
                  <tr key={project.id || project._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id || project._id)}
                        onChange={() => toggleSelectProject(project.id || project._id)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="min-w-[300px]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {project.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {project.shortDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {project.category}
                              </span>
                              {project.verified && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Vérifié
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{project.creatorName}</div>
                      <div className="text-xs text-gray-500">
                        {project.backersCount} investisseurs
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(project.fundedAmount)} / {formatCurrency(project.fundingGoal)} ADA
                      </div>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, (project.fundedAmount / project.fundingGoal) * 100)}%` }}
                        />
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {statusOptions.find(s => s.value === project.status)?.label || project.status}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(project.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Modifié: {formatDate(project.updatedAt)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(`/projects/${project.id || project._id}`, '_blank')}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                          title="Voir le projet"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {project.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(project.id || project._id, 'active')}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                              title="Approuver le projet"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                const reason = prompt('Raison du rejet (optionnel) :')
                                if (reason !== null) {
                                  handleStatusChange(project.id || project._id, 'rejected', reason)
                                }
                              }}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Rejeter le projet"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {(project.status === 'active' || project.status === 'draft') && (
                          <button
                            onClick={() => {
                              const newStatus = project.status === 'active' ? 'cancelled' : 'active'
                              handleStatusChange(project.id || project._id, newStatus)
                            }}
                            className={`p-2 rounded-lg ${
                              project.status === 'active'
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={project.status === 'active' ? 'Annuler le projet' : 'Activer le projet'}
                          >
                            {project.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <div className="relative">
                          <button className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {/* Menu déroulant pour actions supplémentaires */}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredProjects.length)} sur {filteredProjects.length} projets
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun projet trouvé
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? "Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                  : "Il n'y a pas encore de projets à afficher."}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Statistiques rapides</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Projets actifs</span>
                <span className="font-medium">
                  {projects.filter(p => p.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En attente de validation</span>
                <span className="font-medium">
                  {projects.filter(p => p.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux d'approbation</span>
                <span className="font-medium">
                  {projects.length > 0
                    ? `${Math.round((projects.filter(p => p.status === 'active').length / projects.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setStatusFilter('pending')
                  setSearchQuery('')
                }}
                className="w-full px-4 py-2.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 text-left"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Valider les projets en attente</div>
                    <div className="text-sm">{projects.filter(p => p.status === 'pending').length} en attente</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setStatusFilter('draft')
                  setSearchQuery('')
                }}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 text-left"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Voir les brouillons</div>
                    <div className="text-sm">{projects.filter(p => p.status === 'draft').length} brouillons</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Statut actuel</h3>
            <div className="space-y-2">
              {statusOptions.slice(1).map(option => {
                const count = projects.filter(p => p.status === option.value).length
                const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0
                
                return (
                  <div key={option.value} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{option.label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${option.color.split(' ')[0]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}