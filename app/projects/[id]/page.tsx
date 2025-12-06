"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Calendar, 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Clock,
  Shield,
  Heart,
  Share2,
  Bookmark,
  Eye,
  ArrowLeft,
  MessageSquare,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Globe,
  Twitter,
  FileText,
  Download,
  ChevronRight,
  Star,
  Award,
  Briefcase,
  Building,
  GraduationCap,
  Sparkles,
  Loader2
} from "lucide-react"
import { useApi } from "@/lib/hooks/useApi"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"

interface ProjectOwner {
  _id: string
  name: string
  email: string
}

interface Project {
  _id?: string
  id: string
  title: string
  owner: ProjectOwner
  description: string
  shortDescription: string
  category: string
  creatorId: string
  creatorName: string
  fundingGoal: number
  fundedAmount: number
  currency: string
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  duration: number
  minInvestment: number
  expectedROI: number
  images: string[]
  story: string
  risks: string
  updates: any[]
  backersCount: number
  investors: any[]
  milestones: any[]
  tags: string[]
  featured: boolean
  verified: boolean
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailsPage() { // Renommé pour éviter les conflits
  const params = useParams()
  const router = useRouter()
  const { fetchApi, isLoading: apiLoading } = useApi()
  const { user } = useAuth()
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'story' | 'risks' | 'updates'>('overview')
  const [investmentAmount, setInvestmentAmount] = useState<number>(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const projectId = params.id as string

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
    }
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching project with ID:", projectId)
      
      const response = await fetchApi(`/projects/${projectId}`, {
        requiresAuth: false // Essayer sans auth d'abord
      })
      
      console.log("API Response:", response)
      
      if (response.success && response.data) {
        setProject(response.data)
      } else {
        // Essayer avec auth si l'utilisateur est connecté
        if (user) {
          const responseWithAuth = await fetchApi(`/projects/${projectId}`, {
            requiresAuth: true
          })
          
          if (responseWithAuth.success && responseWithAuth.data) {
            setProject(responseWithAuth.data)
          } else {
            setError(responseWithAuth.error || response.error || "Projet non trouvé ou non accessible")
          }
        } else {
          setError(response.error || "Projet non trouvé. Vous devez être connecté pour voir certains projets.")
        }
      }
    } catch (err: any) {
      console.error("Error fetching project:", err)
      setError(err.message || "Erreur lors du chargement du projet")
    } finally {
      setLoading(false)
    }
  }

  const handleInvest = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/projects/${projectId}`)
      return
    }
    
    if (investmentAmount < (project?.minInvestment || 0)) {
      alert(`L'investissement minimum est de ${project?.minInvestment} ${project?.currency}`)
      return
    }
    
    // Ici vous implémenteriez la logique d'investissement
    console.log(`Investissement de ${investmentAmount} ${project?.currency}`)
  }

  const handleShare = () => {
    setShowShareMenu(!showShareMenu)
  }

  const calculateProgress = () => {
    if (!project || project.fundingGoal === 0) return 0
    return Math.min(100, (project.fundedAmount / project.fundingGoal) * 100)
  }

  const calculateDaysLeft = () => {
    if (!project?.endDate) return 0
    const end = new Date(project.endDate).getTime()
    const now = new Date().getTime()
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
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
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'completed': return 'Terminé'
      case 'pending': return 'En attente'
      case 'draft': return 'Brouillon'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'education': return <GraduationCap className="w-5 h-5" />
      case 'technology': return <Sparkles className="w-5 h-5" />
      case 'agriculture': return <Target className="w-5 h-5" />
      case 'health': return <Heart className="w-5 h-5" />
      case 'commerce': return <Briefcase className="w-5 h-5" />
      default: return <Building className="w-5 h-5" />
    }
  }

  // Si loading
  if (loading || apiLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Chargement du projet...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si erreur
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Projet non trouvé"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error?.includes("connecté") ? (
                <>Le projet est peut-être privé. Connectez-vous pour y accéder.</>
              ) : (
                <>Le projet que vous recherchez n'existe pas ou n'est pas accessible.</>
              )}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux projets
              </Link>
              {error?.includes("connecté") && (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const daysLeft = calculateDaysLeft()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-primary to-secondary">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-white hover:text-gray-200 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux projets
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                  {project.verified && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Vérifié
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                  {project.title}
                </h1>
                
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Kinshasa, RDC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Publié le {formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-3 rounded-full ${
                    isBookmarked 
                      ? 'bg-white text-primary' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 relative"
                >
                  <Share2 className="w-5 h-5" />
                  
                  {showShareMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
                      <div className="space-y-1">
                        <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2">
                          <Twitter className="w-4 h-4" />
                          Partager sur Twitter
                        </button>
                        <button 
                          onClick={() => navigator.clipboard.writeText(window.location.href)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Copier le lien
                        </button>
                        
                      </div>
                    </div>
                  )}
                </button>
                {/* // Ajoutez ce bouton dans la section des actions */}
{user && (project.owner === user.id || project.creatorId === user.id || user.role === 'admin') && (
  <Link
    href={`/projects/${projectId}/reports`}
    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
  >
    <BarChart3 className="w-4 h-4" />
    Voir les rapports
  </Link>
)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActiveTab('story')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'story'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  L'histoire
                </button>
                <button
                  onClick={() => setActiveTab('risks')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'risks'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Risques
                </button>
                <button
                  onClick={() => setActiveTab('updates')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'updates'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Mises à jour
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Description
                      </h3>
                      <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                        {project.description}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Catégorie
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getCategoryIcon(project.category)}
                        </div>
                        <span className="text-gray-700 font-medium capitalize">
                          {project.category === 'education' ? 'Éducation' : 
                           project.category === 'technology' ? 'Technologie' : 
                           project.category}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'story' && project.story && (
                  <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                    {project.story}
                  </div>
                )}

                {activeTab === 'risks' && project.risks && (
                  <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                    {project.risks}
                  </div>
                )}

                {activeTab === 'updates' && (
                  <div>
                    {project.updates && project.updates.length > 0 ? (
                      <div className="space-y-6">
                        {project.updates.map((update, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-gray-500">
                                {formatDate(update.createdAt || new Date().toISOString())}
                              </span>
                              {update.type === 'milestone' && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  Jalon atteint
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {update.title || `Mise à jour #${index + 1}`}
                            </h4>
                            <p className="text-gray-600">{update.content || "Pas de contenu disponible"}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Aucune mise à jour pour le moment
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {project.backersCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Investisseurs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {daysLeft}
                    </p>
                    <p className="text-sm text-gray-600">Jours restants</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {project.minInvestment} {project.currency}
                    </p>
                    <p className="text-sm text-gray-600">Investissement min</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {project.expectedROI}%
                    </p>
                    <p className="text-sm text-gray-600">ROI attendu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Porteur de projet
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {project.owner?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.owner?.name || "Utilisateur"}
                  </h3>
                  <p className="text-gray-600">{project.owner?.email || ""}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Email vérifié</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Membre depuis 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Investment Card */}
          <div className="space-y-6">
            {/* Investment Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Collecté</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(project.fundedAmount)} {project.currency}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(project.fundingGoal)} {project.currency}
                    </span>
                  </div>
                </div>

                {/* Key Dates */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Début</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Fin</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(project.endDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Durée</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {project.duration} mois
                    </span>
                  </div>
                </div>

                {/* Investment Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Montant d'investissement ({project.currency})
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[10, 50, 100, 500, 1000, 5000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setInvestmentAmount(amount)}
                        className={`px-3 py-2 text-sm rounded-lg border ${
                          investmentAmount === amount
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>

                  <div className="relative mb-4">
                    <input
                      type="number"
                      min={project.minInvestment}
                      value={investmentAmount || ''}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                      placeholder={`Min. ${project.minInvestment} ${project.currency}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      {project.currency}
                    </span>
                  </div>

                  <button
                    onClick={handleInvest}
                    disabled={!investmentAmount || investmentAmount < project.minInvestment || project.status !== 'active'}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {project.status === 'active' ? 'Investir maintenant' : 'Projet non actif'}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Investissement minimum: {project.minInvestment} {project.currency}
                  </p>
                </div>

                {/* Expected Return */}
                {investmentAmount > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Retour attendu</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700 mb-1">
                      {formatCurrency(investmentAmount * (project.expectedROI / 100))} {project.currency}
                    </p>
                    <p className="text-sm text-green-600">
                      Soit {project.expectedROI}% sur {project.duration} mois
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Questions fréquentes</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Quand vais-je recevoir mes retours?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Les retours sont distribués mensuellement après la phase de démarrage du projet.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Puis-je retirer mon investissement?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Non, les investissements sont bloqués jusqu'à la fin du projet pour garantir sa réussite.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Quels sont les risques?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Comme tout investissement, il y a un risque de perte. Consultez la section Risques pour plus de détails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}