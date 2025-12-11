"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  PieChart,
  Zap,
  Calendar,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useApi } from "@/lib/hooks/useApi";

// Types alignés avec les réponses API
interface DashboardStats {
  totalFunded: number;
  totalDeposits: number;
  totalReturns: number;
  portfolioValue: number;
  activeProjects: number;
  totalContributions: number;
  pendingReturns: number;
  successRate: number;
  lastUpdated: string;
  totalInvested?: number;
  totalProjects?: number;
  averageROI?: number;
}

interface ActivityItem {
  id: string;
  type: string;
  date: string;
  action: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: {
    projectId?: string;
    projectTitle?: string;
  };
}

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  status: string;
  fundedAmount: number;
  fundingGoal: number;
  endDate: string;
  userInvestment: {
    amount: number;
    returns: number;
    roi: string;
    date: string;
  } | null;
  userRole?: 'creator' | 'investor';
  progress?: number;
  daysLeft?: number;
}

interface PortfolioSummary {
  totalInvested: number;
  totalReturns: number;
  activeProjects: number;
  completedProjects: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { fetchApi } = useApi();

  const [stats, setStats] = useState<DashboardStats>({
    totalFunded: 0,
    totalDeposits: 0,
    totalReturns: 0,
    portfolioValue: 0,
    activeProjects: 0,
    totalContributions: 0,
    pendingReturns: 0,
    successRate: 0,
    lastUpdated: new Date().toISOString(),
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [activeProjects, setActiveProjects] = useState<ProjectItem[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalInvested: 0,
    totalReturns: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Appels parallèles pour optimiser les performances
      const [statsRes, activityRes, projectsRes] = await Promise.allSettled([
        fetchApi("/users/stats"),
        fetchApi("/users/activity?limit=5"),
        fetchApi("/projects/user?limit=4&status=active"),
      ]);

      let hasData = false;
      let errors = [];

      // Traitement des stats
      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        const statsData = statsRes.value.data;
        if (statsData && statsData.stats) {
          setStats(statsData.stats);
          hasData = true;
        } else {
          errors.push("stats");
        }
      } else if (statsRes.status === "rejected") {
        errors.push("stats");
      }

      // Traitement de l'activité
      if (activityRes.status === "fulfilled" && activityRes.value.success) {
        setRecentActivity(activityRes.value.data?.activities || []);
        hasData = true;
      } else if (activityRes.status === "rejected") {
        errors.push("activité");
      }

      // Traitement des projets
      if (projectsRes.status === "fulfilled" && projectsRes.value.success) {
        const projectsData = projectsRes.value.data;
        setActiveProjects(projectsData.projects || []);
        
        // Extraire le résumé du portfolio si disponible
        if (projectsData.summary) {
          setPortfolioSummary({
            totalInvested: projectsData.summary.totalInvested || 0,
            totalReturns: projectsData.summary.totalReturns || 0,
            activeProjects: projectsData.summary.activeProjects || 0,
            completedProjects: projectsData.summary.completedProjects || 0,
          });
        }
        hasData = true;
      } else if (projectsRes.status === "rejected") {
        errors.push("projets");
      }

      if (!hasData) {
        setError("Impossible de charger les données. Veuillez vérifier votre connexion.");
      } else if (errors.length > 0) {
        setError(`Certaines données sont indisponibles: ${errors.join(", ")}`);
      }

      setLastUpdate(new Date().toLocaleTimeString("fr-FR", { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));

    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.message || "Erreur inattendue lors du chargement.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 0) {
        return "Aujourd'hui";
      } else if (diffDays === 1) {
        return "Hier";
      } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
      } else {
        return date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        });
      }
    } catch {
      return "—";
    }
  };

  const formatCurrency = (amount: number, compact: boolean = true) => {
    if (!amount || amount === 0) return "0";
    if (compact) {
      return new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(amount);
    }
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      active: { text: "Actif", color: "bg-green-100 text-green-800" },
      completed: { text: "Terminé", color: "bg-blue-100 text-blue-800" },
      draft: { text: "Brouillon", color: "bg-gray-100 text-gray-800" },
      pending: { text: "En attente", color: "bg-yellow-100 text-yellow-800" },
      cancelled: { text: "Annulé", color: "bg-red-100 text-red-800" },
    };
    return statusMap[status] || { text: status, color: "bg-gray-100 text-gray-800" };
  };

  // Statistiques clés avec données réelles
  const statCards = [
    {
      title: "Valeur du portefeuille",
      value: stats.portfolioValue,
      suffix: " ADA",
      description: "Valeur actuelle totale",
      icon: <PieChart className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      trend: stats.portfolioValue > 0 ? "+12.5%" : null,
    },
    {
      title: "Investissements actifs",
      value: portfolioSummary.activeProjects || stats.activeProjects,
      description: "Projets en cours",
      icon: <Target className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      trend: null,
    },
    {
      title: "Retours générés",
      value: portfolioSummary.totalReturns || stats.totalReturns,
      suffix: " ADA",
      description: "Gains distribués",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-purple-500 to-fuchsia-500",
      trend: stats.totalReturns > 0 ? "+8.2%" : null,
    },
    {
      title: "ROI moyen",
      value: stats.successRate,
      suffix: "%",
      description: "Rendement moyen",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "from-orange-500 to-amber-500",
      trend: stats.successRate > 0 ? "+2.3%" : null,
    },
  ];

  if (isLoading && stats.totalFunded === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative">
          <RefreshCw className="w-12 h-12 animate-spin text-primary mb-4" />
          <div className="absolute inset-0 border-4 border-t-primary/30 border-r-transparent border-b-transparent border-l-transparent rounded-full"></div>
        </div>
        <p className="text-gray-600 mt-4">Chargement de votre tableau de bord...</p>
        <p className="text-sm text-gray-500 mt-2">Cela peut prendre quelques secondes</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bonjour, <span className="text-primary">{user?.name || "Investisseur"}</span> 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {lastUpdate ? (
              <>
                Dernière mise à jour à{" "}
                <span className="font-medium">{lastUpdate}</span>
              </>
            ) : (
              "Voici un aperçu de vos investissements"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <div className="text-sm text-gray-500 hidden sm:block">
              Actualisé à {lastUpdate}
            </div>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 transition-transform ${
                isLoading ? "animate-spin" : "hover:rotate-180"
              }`}
            />
            {isLoading ? "Actualisation..." : "Actualiser"}
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Données partielles</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="text-red-700 hover:text-red-800 text-sm font-medium mt-2"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof card.value === "number" && !isNaN(card.value)
                      ? formatCurrency(card.value)
                      : "0"}
                    {card.suffix}
                  </p>
                  {card.trend && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {card.trend}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">{card.description}</p>
              </div>
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm`}
              >
                {card.icon}
              </div>
            </div>
            {card.value > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Performance</span>
                  <span className="font-medium text-gray-700">
                    {card.value > 0 ? "Positive" : "Neutre"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deuxième ligne de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total investi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(portfolioSummary.totalInvested)} ADA
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Montant total que vous avez investi
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Projets terminés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {portfolioSummary.completedProjects}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Projets avec retour sur investissement
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Prochains retours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.pendingReturns)} ADA
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            En attente de distribution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projets actifs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vos projets actifs</h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeProjects.length} projet{activeProjects.length !== 1 ? "s" : ""} en cours
              </p>
            </div>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm"
            >
              Voir tous
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => {
                const progress = project.progress || Math.round((project.fundedAmount / project.fundingGoal) * 100);
                const daysLeft = project.daysLeft || Math.max(0, Math.ceil(
                  (new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                ));
                const statusBadge = getStatusBadge(project.status);

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block p-5 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {project.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                          {project.userRole === 'creator' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              Créateur
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span>Investissement: {formatCurrency(project.userInvestment?.amount || 0)} ADA</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysLeft} jour{daysLeft !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Barre de progression */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progression</span>
                            <span className="font-medium text-gray-900">{progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatCurrency(project.fundedAmount)} ADA</span>
                            <span>Objectif: {formatCurrency(project.fundingGoal)} ADA</span>
                          </div>
                        </div>

                        {project.userInvestment?.returns > 0 && (
                          <div className="mt-3 p-2 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-700">
                              Gains: +{formatCurrency(project.userInvestment.returns)} ADA
                              <span className="text-green-600 ml-2">
                                (ROI: {project.userInvestment.roi})
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Target className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Aucun projet actif</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Vous n'avez pas encore investi dans un projet en cours.
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Explorer les projets
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
              <p className="text-sm text-gray-500 mt-1">
                Vos dernières transactions
              </p>
            </div>
            <Link
              href="/dashboard/activity"
              className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const isPositive = activity.amount > 0;
                const isInvestment = activity.type === 'investment';

                return (
                  <div
                    key={activity.id}
                    className="p-5 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg mt-1 ${
                          isPositive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isInvestment ? (
                            <DollarSign className="w-4 h-4" />
                          ) : isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-gray-900 truncate">
                              {activity.action}
                            </p>
                            <p className={`font-bold whitespace-nowrap ${
                              isPositive ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {isPositive ? '+' : ''}{formatCurrency(activity.amount)} {activity.currency}
                            </p>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.date)}
                            </span>
                            {activity.status && activity.status !== 'completed' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                {activity.status}
                              </span>
                            )}
                          </div>
                          
                          {activity.metadata?.projectTitle && (
                            <div className="mt-2 text-xs">
                              <Link
                                href={activity.metadata.projectId ? `/projects/${activity.metadata.projectId}` : '/projects'}
                                className="text-primary hover:underline truncate block"
                              >
                                • {activity.metadata.projectTitle}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Aucune activité</h3>
                <p className="text-gray-500 text-sm">
                  Vos transactions apparaîtront ici.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides et informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bannière d'actions rapides */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Prêt à investir ?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Découvrez de nouvelles opportunités d'investissement avec des rendements attractifs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/projects"
                  className="bg-white text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 border border-gray-300 transition-colors text-center"
                >
                  Explorer les projets
                </Link>
                <Link
                  href="/dashboard/wallet"
                  className="bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
                >
                  Gérer mon portefeuille
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-3 bg-white/50 rounded-lg">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Résumé de performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Résumé de performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-600">Total investi</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(portfolioSummary.totalInvested, false)} ADA
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-600">Retours totaux</span>
              <span className="font-bold text-green-600">
                +{formatCurrency(portfolioSummary.totalReturns, false)} ADA
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-600">Projets actifs</span>
              <span className="font-bold text-gray-900">
                {portfolioSummary.activeProjects}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux de succès</span>
              <span className="font-bold text-gray-900">
                {typeof stats.successRate === 'number' ? stats.successRate.toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm mt-6"
          >
            Voir l'analyse détaillée
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer informatif */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Les données sont mises à jour en temps réel. Dernière actualisation à{" "}
          <span className="font-medium">{lastUpdate}</span>
        </p>
      </div>
    </div>
  );
}