"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity, 
  Loader2, 
  ArrowUpRight,
  TrendingDown,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useApi } from "@/lib/hooks/useApi"

interface DashboardStats {
  totalFunded: number
  totalDeposits: number
  totalReturns: number
  portfolioValue: number
  activeProjects: number
  totalContributions: number
  pendingReturns: number
  successRate: number
  lastUpdated: string
}

interface ActivityItem {
  id: string
  type: string
  date: string
  action: string
  description: string
  amount: number
  currency: string
  status: string
  metadata?: {
    projectId?: string
    projectTitle?: string
  }
}

interface ProjectItem {
  id: string
  title: string
  description: string
  category: string
  status: string
  userInvestment: {
    amount: number
    returns: number
    roi: string
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const { fetchApi, isLoading: apiLoading, error: apiError } = useApi()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalFunded: 0,
    totalDeposits: 0,
    totalReturns: 0,
    portfolioValue: 0,
    activeProjects: 0,
    totalContributions: 0,
    pendingReturns: 0,
    successRate: 0,
    lastUpdated: new Date().toISOString()
  })
  
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [recentProjects, setRecentProjects] = useState<ProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const dashboardStats = [
    { 
      label: "Total Funded", 
      value: `${stats.totalFunded.toLocaleString()} Ada`, 
      icon: DollarSign, 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total invested in projects"
    },
    { 
      label: "Active Projects", 
      value: stats.activeProjects.toString(), 
      icon: Target, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Projects you're currently funding"
    },
    { 
      label: "Total Returns", 
      value: `+${stats.totalReturns.toLocaleString()} Ada`, 
      icon: TrendingUp, 
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Earnings from investments"
    },
    { 
      label: "Portfolio Value", 
      value: `${stats.portfolioValue.toLocaleString()} Ada`, 
      icon: Activity, 
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Current value of all investments"
    },
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Appels API parallèles pour meilleures performances
      const [statsResponse, activityResponse, projectsResponse] = await Promise.allSettled([
        fetchApi('/users/stats'),
        fetchApi('/users/activity?limit=5'),
        fetchApi('/projects/user?limit=3&status=active')
      ])

      // Gérer les réponses des stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        const apiStats = statsResponse.value.data?.stats || {}
        setStats(prev => ({
          ...prev,
          ...apiStats,
          lastUpdated: new Date().toISOString()
        }))
      } else {
        console.warn('Failed to fetch stats:', statsResponse)
      }

      // Gérer les réponses d'activité
      if (activityResponse.status === 'fulfilled' && activityResponse.value.success) {
        const activities = activityResponse.value.data?.activities || []
        setRecentActivity(activities.map(formatActivity))
      }

      // Gérer les réponses de projets
      if (projectsResponse.status === 'fulfilled' && projectsResponse.value.success) {
        const projects = projectsResponse.value.data?.projects || []
        setRecentProjects(projects.map(formatProject))
      }

      // Vérifier s'il y a des erreurs
      const errors = [
        statsResponse.status === 'rejected' && 'stats',
        activityResponse.status === 'rejected' && 'activity',
        projectsResponse.status === 'rejected' && 'projects'
      ].filter(Boolean)

      if (errors.length > 0) {
        console.warn('Some data failed to load:', errors)
        if (errors.length === 3) {
          setError('Unable to load dashboard data. Please try again.')
        }
      }

      setLastRefresh(new Date())

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatActivity = (activity: any): ActivityItem => {
    return {
      id: activity.id || activity._id,
      type: activity.type,
      date: activity.date || activity.createdAt,
      action: activity.action,
      description: activity.description,
      amount: activity.amount || 0,
      currency: activity.currency || 'ADA',
      status: activity.status,
      metadata: activity.metadata
    }
  }

  const formatProject = (project: any): ProjectItem => {
    return {
      id: project.id || project._id,
      title: project.title,
      description: project.description,
      category: project.category,
      status: project.status,
      userInvestment: {
        amount: project.userInvestment?.amount || 0,
        returns: project.userInvestment?.returns || 0,
        roi: project.userInvestment?.roi || '0%'
      }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"
    
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"
    
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"
    
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"
    
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"
    
    return Math.floor(seconds) + " seconds ago"
  }

  const getTrendIndicator = (current: number, previous: number) => {
    if (previous === 0) return { icon: ArrowUpRight, color: 'text-green-500', text: '+100%' }
    
    const change = ((current - previous) / previous) * 100
    const isPositive = change >= 0
    
    return {
      icon: isPositive ? ArrowUpRight : TrendingDown,
      color: isPositive ? 'text-green-500' : 'text-red-500',
      text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`
    }
  }

  if (isLoading && !stats.totalFunded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching your portfolio data</p>
        </div>
      </div>
    )
  }

  if (error && !stats.totalFunded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header with Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-primary">{user?.name}</span>!
          </h1>
          <p className="text-gray-600">
            {stats.lastUpdated ? `Last updated ${formatTimeAgo(new Date(stats.lastUpdated))}` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span>{isLoading ? 'Updating...' : 'Live data'}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <Activity size={20} />
            <p className="text-sm font-medium">{apiError}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          const trend = getTrendIndicator(stat.value.includes('+') ? parseFloat(stat.value) : parseFloat(stat.value.replace(/,/g, '')), 0)
          const TrendIcon = trend.icon
          
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                  <span className={`text-xs font-medium ${trend.color}`}>{trend.text}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-2">{stat.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Contributions</p>
              <p className="text-2xl font-bold">{stats.totalContributions}</p>
              <p className="text-xs opacity-75 mt-2">Across all projects</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending Returns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReturns.toLocaleString()} Ada</p>
              <p className="text-gray-400 text-xs mt-2">Awaiting distribution</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              <p className="text-gray-400 text-xs mt-2">Project completion rate</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600 text-sm mt-1">Your latest transactions and actions</p>
          </div>
          <Link 
            href="/dashboard/activity" 
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
          >
            View all
            <ArrowUpRight size={16} />
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      activity.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {activity.amount > 0 ? '+' : '−'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {activity.description}
                      {activity.metadata?.projectTitle && (
                        <span className="text-primary font-medium ml-1">
                          • {activity.metadata.projectTitle}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{formatDate(activity.date)}</p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${
                  activity.amount > 0 ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {activity.amount > 0 ? '+' : '−'}{Math.abs(activity.amount).toLocaleString()} {activity.currency}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">Your activity will appear here once you start using the platform</p>
              <Link
                href="/projects"
                className="inline-block mt-4 text-primary hover:text-primary/80 font-medium"
              >
                Explore projects →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Active Projects</h2>
              <p className="text-gray-600 text-sm mt-1">Projects you're currently funding</p>
            </div>
            <Link 
              href="/dashboard/projects" 
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentProjects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">{project.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Your Investment: </span>
                        <span className="font-medium text-gray-900">
                          {project.userInvestment.amount.toLocaleString()} Ada
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Returns: </span>
                        <span className="font-medium text-green-600">
                          +{project.userInvestment.returns.toLocaleString()} Ada
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">ROI: </span>
                        <span className="font-medium text-primary">
                          {project.userInvestment.roi}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                  >
                    View Details
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/wallet"
          className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Wallet</h3>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="opacity-90">Manage your funds and transactions</p>
          <div className="mt-4 text-sm opacity-75">
            {stats.totalDeposits ? `${stats.totalDeposits.toLocaleString()} Ada available` : 'Connect your wallet'}
          </div>
        </Link>
        
        <Link
          href="/projects"
          className="bg-gradient-to-r from-secondary to-secondary/80 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Explore Projects</h3>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="opacity-90">Discover new projects to support</p>
          <div className="mt-4 text-sm opacity-75">
            Browse vetted investment opportunities
          </div>
        </Link>
        
        <Link
          href="/dashboard/projects"
          className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">My Projects</h3>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="opacity-90">View and manage your investments</p>
          <div className="mt-4 text-sm opacity-75">
            {stats.activeProjects} active projects
          </div>
        </Link>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-gray-600">Updating data...</span>
        </div>
      )}
    </div>
  )
}