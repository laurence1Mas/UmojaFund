"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp,
  Calendar,
  DollarSign,
  PieChart,
  Download,
  ArrowLeft,
  Shield,
  Eye,
  Edit,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingDown
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'

interface ProjectReport {
  project: {
    id: string
    title: string
    status: string
    category: string
    creatorName: string
    createdAt: string
    startDate: string
    endDate: string
    verified: boolean
  }
  stats: {
    investment: {
      totalInvested: number
      averageInvestment: number
      maxInvestment: number
      minInvestment: number
      totalReturns: number
      investorCount: number
    }
    milestones: {
      total: number
      completed: number
      inProgress: number
      pending: number
      totalAmountRequired: number
      completedAmount: number
    }
    funding: {
      goal: number
      funded: number
      percentage: number
      daysLeft: number
    }
    backersCount: number
    updatesCount: number
  }
  investors: Array<{
    userId: string
    userName: string
    userEmail?: string
    userAvatar?: string
    amount: number
    date: string
    returns: number
    roi: string
  }>
  investmentTimeline: Array<{
    date: string
    amount: number
    count: number
    cumulativeAmount: number
  }>
  milestones: Array<any>
  updates: Array<any>
  permissions: {
    isCreator: boolean
    isAdmin: boolean
    hasInvested: boolean
    canEdit: boolean
  }
}

export default function ProjectReportsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  
  const [report, setReport] = useState<ProjectReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  const projectId = params.id as string

  useEffect(() => {
    if (projectId) {
      fetchReport()
    }
  }, [projectId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/projects/${projectId}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setReport(data.data)
      } else {
        setError(data.error || 'Impossible de charger les rapports')
        
        // Rediriger si non autorisé
        if (response.status === 403) {
          setTimeout(() => {
            router.push(`/projects/${projectId}`)
          }, 2000)
        }
      }
    } catch (err: any) {
      console.error('Error fetching report:', err)
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExportData = (format: 'csv' | 'pdf' = 'csv') => {
    if (!report) return
    
    if (format === 'csv') {
      // Créer un CSV des investisseurs
      const headers = ['Nom', 'Email', 'Montant', 'Date', 'Retours', 'ROI']
      const rows = report.investors.map(inv => [
        inv.userName,
        inv.userEmail || '',
        inv.amount,
        formatDate(inv.date),
        inv.returns,
        inv.roi
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${projectId}-investisseurs.csv`
      a.click()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchReport}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Réessayer
                </button>
                <Link
                  href={`/projects/${projectId}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  Retour au projet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune donnée disponible</h2>
            <p className="text-gray-600">Les rapports pour ce projet ne sont pas disponibles.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/projects/${projectId}`}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Rapports - {report.project.title}
                </h1>
                <p className="text-gray-600">
                  Statistiques et analyses détaillées
                  {report.permissions.isCreator && ' • Vous êtes le créateur'}
                  {report.permissions.hasInvested && !report.permissions.isCreator && ' • Vous avez investi'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExportData('csv')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
              
              {report.permissions.canEdit && (
                <Link
                  href={`/projects/${projectId}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Vue d'ensemble
            </button>
            
            <button
              onClick={() => setActiveTab('investors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'investors'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Investisseurs ({report.stats.investment.investorCount})
            </button>
            
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'milestones'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Jalons ({report.milestones.length})
            </button>
            
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Évolution
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Capital levé</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(report.stats.funding.funded)}
                    </p>
                    <p className="text-sm text-gray-500">
                      sur {formatCurrency(report.stats.funding.goal)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span className="font-medium">{formatPercentage(report.stats.funding.percentage)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, report.stats.funding.percentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Investisseurs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.stats.investment.investorCount}
                    </p>
                    <p className="text-sm text-gray-500">
                      Investissement moyen: {formatCurrency(report.stats.investment.averageInvestment)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between">
                    <span>Max</span>
                    <span className="font-medium">{formatCurrency(report.stats.investment.maxInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min</span>
                    <span className="font-medium">{formatCurrency(report.stats.investment.minInvestment)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jalons</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.stats.milestones.completed}/{report.stats.milestones.total}
                    </p>
                    <p className="text-sm text-gray-500">
                      {report.stats.milestones.inProgress} en cours
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Complétion</span>
                    <span className="font-medium">
                      {report.stats.milestones.total > 0 
                        ? `${Math.round((report.stats.milestones.completed / report.stats.milestones.total) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ 
                        width: `${report.stats.milestones.total > 0 
                          ? Math.min(100, (report.stats.milestones.completed / report.stats.milestones.total) * 100)
                          : 0
                        }%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Temps restant</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.stats.funding.daysLeft} jours
                    </p>
                    <p className="text-sm text-gray-500">
                      Fin: {formatDate(report.project.endDate)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between">
                    <span>Début</span>
                    <span>{formatDate(report.project.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.project.status === 'active' ? 'bg-green-100 text-green-800' :
                      report.project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      report.project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.project.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribution des investissements
                </h3>
                <div className="space-y-4">
                  {report.investors.slice(0, 5).map((investor, index) => (
                    <div key={investor.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {investor.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{investor.userName}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(investor.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(investor.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ROI: {investor.roi}%
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {report.investors.length > 5 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 text-center">
                        Et {report.investors.length - 5} autres investisseurs...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé des retours
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Total investi</span>
                      <span className="font-medium">{formatCurrency(report.stats.investment.totalInvested)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Retours générés</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(report.stats.investment.totalReturns)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ 
                          width: `${report.stats.investment.totalInvested > 0 
                            ? Math.min(100, (report.stats.investment.totalReturns / report.stats.investment.totalInvested) * 100)
                            : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">ROI moyen</p>
                      <p className="text-xl font-bold text-gray-900">
                        {report.stats.investment.totalInvested > 0
                          ? `${((report.stats.investment.totalReturns / report.stats.investment.totalInvested) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Taux de succès</p>
                      <p className="text-xl font-bold text-gray-900">
                        {report.stats.funding.percentage >= 100 ? '100%' : `${report.stats.funding.percentage.toFixed(0)}%`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investors' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Liste des investisseurs ({report.investors.length})
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un investisseur..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Exporter
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.investors.map((investor) => (
                    <tr key={investor.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {investor.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{investor.userName}</p>
                            {investor.userEmail && (
                              <p className="text-sm text-gray-500">{investor.userEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(investor.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{formatDate(investor.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-medium ${
                          investor.returns > 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(investor.returns)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          parseFloat(investor.roi) > 0 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {investor.roi}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {report.investors.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun investisseur
                </h3>
                <p className="text-gray-600">
                  Ce projet n'a pas encore d'investisseurs.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Progression des jalons
              </h3>
              
              <div className="space-y-4">
                {report.milestones.map((milestone, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status === 'completed' ? 'Terminé' :
                           milestone.status === 'in-progress' ? 'En cours' : 'En attente'}
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(milestone.amountRequired || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Montant requis</span>
                      <span>{formatCurrency(milestone.amountRequired || 0)}</span>
                    </div>
                    
                    {milestone.completionDate && (
                      <div className="text-sm text-gray-600">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Complété le: {formatDate(milestone.completionDate)}
                      </div>
                    )}
                  </div>
                ))}
                
                {report.milestones.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun jalon défini pour ce projet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Évolution des investissements
              </h3>
              
              <div className="space-y-6">
                {report.investmentTimeline.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-900 font-medium">{item.date}</span>
                        <span className="text-gray-900 font-bold">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full"
                          style={{ 
                            width: `${report.stats.investment.totalInvested > 0
                              ? (item.amount / report.stats.investment.totalInvested) * 100
                              : 0
                            }%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{item.count} investissement{item.count > 1 ? 's' : ''}</span>
                        <span>Cumul: {formatCurrency(item.cumulativeAmount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {report.investmentTimeline.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun investissement enregistré.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}