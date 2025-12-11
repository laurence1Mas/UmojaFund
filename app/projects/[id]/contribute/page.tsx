"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useApi } from "@/lib/hooks/useApi"
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Loader2, 
  QrCode,
  Shield,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react"

interface Project {
  _id: string
  title: string
  description: string
  shortDescription: string
  category: string
  creatorName: string
  creatorAddress?: string
  fundingGoal: number
  fundedAmount: number
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'failed'
  startDate: string      // ✅ ajouté
  endDate: string        // ✅ au lieu de endDate
  images: string[]
  verified: boolean
  backersCount: number
  createdAt: string
  minInvestment: number  // ✅ nécessaire pour le formulaire
  expectedROI: number    // ✅
}

interface CheckoutData {
  paymentAddress: string
  amountADA: number
  projectId: string
  projectTitle: string
  checkoutId: string
  expiresAt: string
  qrCodeUrl: string
  isSimulated: boolean
  simulationNote: string
}

interface ContributionResponse {
  success: boolean
  message: string
  data: {
    contributionId: string
    amountADA: number
    status: 'pending' | 'confirmed'
    txHash: string
  }
}

interface CheckoutResponse {
  success: boolean
  message: string
  data: CheckoutData
}

export default function ContributePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { fetchApi } = useApi()
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // État de la contribution
  const [amount, setAmount] = useState<number>(10)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [selectedAmount, setSelectedAmount] = useState<number>(10)
  
  // État du checkout
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [contributionStatus, setContributionStatus] = useState<'idle' | 'checkout' | 'pending' | 'success' | 'error'>('idle')
  const [contributionError, setContributionError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const projectId = params.id as string
  
  // Charger les informations du projet
  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])
  
  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/projects/${projectId}/contribute`)
    }
  }, [isAuthenticated, projectId, router])
  
  const fetchProject = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetchApi(`/projects/${projectId}`, {
        requiresAuth: false
      })
      
      if (response.success) {
        setProject(response.data)
      } else {
        setError(response.error || "Impossible de charger le projet")
      }
    } catch (err: any) {
      console.error("Error fetching project:", err)
      setError(err.message || "Erreur lors du chargement du projet")
    } finally {
      setLoading(false)
    }
  }
  
  // Vérifier si la campagne est active
  const isCampaignActive = () => {
    if (!project) return false
    if (project.status !== 'active') return false
    
    const endDate = new Date(project.endDate)
    const now = new Date()
    return endDate > now
  }
  // Calculer les jours restants
  const getDaysLeft = () => {
  if (!project?.endDate) return 0
  const endDate = new Date(project.endDate)
  const now = new Date()
  if (isNaN(endDate.getTime())) return 0 // Sécurité
  const diffTime = endDate.getTime() - now.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}
  
  // Calculer la progression
  const getProgressPercentage = () => {
const current = project?.fundedAmount || 0
const goal = project?.fundingGoal || 1
return Math.min(100, (current / goal) * 100)
  }
  
  // Formater l'argent
  const formatADA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ADA'
  }
  
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  
  // Montants prédéfinis
  const presetAmounts = [10, 25, 50, 100, 250, 500]
  
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setAmount(amount)
    setCustomAmount("")
  }
  
  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    if (value) {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 1) {
        setAmount(numValue)
        setSelectedAmount(numValue)
      }
    }
  }
  
  // Générer le checkout
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/projects/${projectId}/contribute`)
      return
    }
    
    if (amount < 1) {
      setContributionError("Le montant minimum est 1 ADA")
      return
    }
    
    if (!isCampaignActive()) {
      setContributionError("Cette campagne n'est plus active")
      return
    }
    
    try {
      setProcessing(true)
      setContributionError(null)
      setContributionStatus('pending')
      
      // Appel API pour générer le checkout
      const response = await fetchApi(`/projects/${projectId}/contribute/checkout`, {
        method: 'POST',
        requiresAuth: true,
        body: { amountADA: amount }
      }) as CheckoutResponse
      
      if (response.success) {
        setCheckoutData(response.data)
        setContributionStatus('checkout')
        
        // Démarrer le compte à rebours
        const expiresAt = new Date(response.data.expiresAt).getTime()
        const now = new Date().getTime()
        const secondsLeft = Math.floor((expiresAt - now) / 1000)
        
        if (secondsLeft > 0) {
          setCountdown(secondsLeft)
          
          // Mettre à jour le compte à rebours chaque seconde
          const interval = setInterval(() => {
            setCountdown(prev => {
              if (prev && prev > 0) {
                return prev - 1
              } else {
                clearInterval(interval)
                return 0
              }
            })
          }, 1000)
        }
      } else {
        setContributionError(response.error || "Erreur lors de la génération du checkout")
        setContributionStatus('error')
      }
    } catch (err: any) {
      console.error("Checkout error:", err)
      setContributionError(err.message || "Erreur lors du traitement")
      setContributionStatus('error')
    } finally {
      setProcessing(false)
    }
  }
  
  // Confirmer la contribution (simulation)
  const handleConfirmContribution = async () => {
    if (!checkoutData) return
    
    try {
      setProcessing(true)
      
      // Simuler une transaction Cardano
      const response = await fetchApi(`/projects/${projectId}/contribute`, {
        method: 'POST',
        requiresAuth: true,
        body: { amountADA: amount }
      }) as ContributionResponse
      
      if (response.success) {
        setContributionStatus('success')
        
        // Rediriger vers la page de confirmation après 3 secondes
        setTimeout(() => {
          router.push(`/projects/${projectId}/contribution/success?contributionId=${response.data.contributionId}`)
        }, 3000)
      } else {
        setContributionError(response.error || "Erreur lors de la confirmation")
        setContributionStatus('error')
      }
    } catch (err: any) {
      console.error("Confirm contribution error:", err)
      setContributionError(err.message || "Erreur lors de la confirmation")
      setContributionStatus('error')
    } finally {
      setProcessing(false)
    }
  }
  
  // Formater le compte à rebours
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-gray-600">Vérification de l'authentification...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="h-64 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error || "Projet non trouvé"}
              </h2>
              <p className="text-gray-600 mb-6">
                Impossible d'accéder à la page de contribution
              </p>
              <Link
                href={`/projects/${projectId}`}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au projet
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  const daysLeft = getDaysLeft()
  const progressPercentage = getProgressPercentage()
  const isActive = isCampaignActive()
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Link
                  href={`/projects/${projectId}`}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour au projet
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Contribuer au projet
                </h1>
                <p className="text-gray-600">{project.title}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Collecté</div>
                  <div className="text-xl font-bold text-primary">
                    {formatADA(project.fundedAmount)}
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Objectif</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatADA(project.fundingGoal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne de gauche : Informations du projet */}
            <div className="space-y-6">
              {/* Progression */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Progression du projet</h3>
                  <span className="text-lg font-bold text-primary">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Collecté : {formatADA(project.fundedAmount)}</span>
                  <span>Objectif : {formatADA(project.fundingGoal)}</span>
                </div>
              </div>
              
              {/* Statut de la campagne */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Statut de la campagne</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Statut</div>
                        <div className="text-sm text-gray-600">
                          {isActive ? 'Campagne active' : 'Campagne terminée'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {isActive ? 'Actif' : 'Terminé'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Date limite</div>
                        <div className="text-sm text-gray-600">{formatDate(project.endDate)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{daysLeft}</div>
                      <div className="text-sm text-gray-600">jours restants</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Contributeurs</div>
                        <div className="text-sm text-gray-600">Personnes ayant déjà contribué</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{project.backersCount}</div>
                      <div className="text-sm text-gray-600">personnes</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations de sécurité */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Sécurité garantie</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Paiements 100% sécurisés</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Fonds versés uniquement si le projet atteint son objectif</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Transactions vérifiées sur la blockchain Cardano</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne de droite : Formulaire de contribution */}
            <div className="space-y-6">
              {/* Étape 1 : Sélection du montant */}
              {contributionStatus === 'idle' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Choisissez votre montant
                  </h3>
                  
                  {/* Montants prédéfinis */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {presetAmounts.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleAmountSelect(preset)}
                          className={`px-4 py-3 border rounded-lg text-center transition-all ${
                            selectedAmount === preset
                              ? 'border-primary bg-primary/10 text-primary font-semibold'
                              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          {formatADA(preset)}
                        </button>
                      ))}
                    </div>
                    
                    {/* Montant personnalisé */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ou entrez un montant personnalisé
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={customAmount}
                          onChange={(e) => handleCustomAmount(e.target.value)}
                          placeholder="Montant en ADA"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          ADA
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Montant minimum : 1 ADA
                      </p>
                    </div>
                  </div>
                  
                  {/* Résumé */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Votre contribution</span>
                      <span className="text-xl font-bold text-primary">{formatADA(amount)}</span>
                    </div>
                    {project.verified && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Projet vérifié ✓</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton de contribution */}
                  <button
                    onClick={handleCheckout}
                    disabled={!isActive || processing || amount < 1}
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Traitement...
                      </div>
                    ) : !isActive ? (
                      "Campagne terminée"
                    ) : (
                      `Contribuer ${formatADA(amount)}`
                    )}
                  </button>
                  
                  {!isActive && (
                    <p className="text-center text-sm text-red-600 mt-3">
                      Les contributions sont fermées pour cette campagne
                    </p>
                  )}
                  
                  {contributionError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{contributionError}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Étape 2 : Paiement Cardano */}
              {contributionStatus === 'checkout' && checkoutData && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Paiement Cardano</h3>
                      <p className="text-gray-600">Envoyez {formatADA(amount)} à l'adresse suivante</p>
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div className="mb-6 text-center">
                    <div className="inline-block p-4 bg-white border border-gray-300 rounded-lg">
                      <img
                        src={checkoutData.qrCodeUrl}
                        alt="QR Code pour paiement"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Scannez avec votre wallet mobile
                    </p>
                  </div>
                  
                  {/* Adresse de paiement */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse de paiement
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={checkoutData.paymentAddress}
                        readOnly
                        className="w-full pr-10 py-3 border border-gray-300 bg-gray-50 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(checkoutData.paymentAddress)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Montant */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant exact à envoyer
                    </label>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-2xl font-bold text-primary">{formatADA(amount)}</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        ⚠️ Envoyez exactement ce montant. Les montants différents ne seront pas acceptés.
                      </p>
                    </div>
                  </div>
                  
                  {/* Compte à rebours */}
                  {countdown !== null && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Temps restant</span>
                        <span className={`text-sm font-medium ${countdown < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatCountdown(countdown)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(countdown / (15 * 60)) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        L'adresse expirera après 15 minutes
                      </p>
                    </div>
                  )}
                  
                  {/* Note simulation */}
                  {checkoutData.isSimulated && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-green-800 font-medium">
                            Mode simulation Cardano
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            En développement, la transaction est automatiquement confirmée.
                            Cliquez sur "Simuler le paiement" pour continuer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Boutons d'action */}
                  <div className="space-y-3">
                    <button
                      onClick={handleConfirmContribution}
                      disabled={processing}
                      className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {processing ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Confirmation en cours...
                        </div>
                      ) : checkoutData.isSimulated ? (
                        "Simuler le paiement"
                      ) : (
                        "J'ai envoyé le paiement"
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setContributionStatus('idle')
                        setCheckoutData(null)
                      }}
                      className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                    >
                      Modifier le montant
                    </button>
                  </div>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Après avoir envoyé les fonds, la confirmation peut prendre quelques minutes
                  </p>
                </div>
              )}
              
              {/* Étape 3 : Confirmation en attente */}
              {contributionStatus === 'pending' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmation en cours
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Votre contribution est en cours de vérification sur la blockchain Cardano...
                  </p>
                  <div className="animate-pulse space-y-2 max-w-md mx-auto">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              )}
              
              {/* Étape 4 : Succès */}
              {contributionStatus === 'success' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Contribution réussie ! 🎉
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Merci d'avoir contribué à ce projet. Vous êtes maintenant un soutien officiel !
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Montant contribué</span>
                      <span className="text-lg font-bold text-primary">{formatADA(amount)}</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Redirection vers la page de confirmation...
                    </p>
                  </div>
                </div>
              )}
              
              {/* Étape 5 : Erreur */}
              {contributionStatus === 'error' && contributionError && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    Oups, une erreur est survenue
                  </h3>
                  <p className="text-gray-600 mb-6 text-center">
                    {contributionError}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setContributionStatus('idle')
                        setContributionError(null)
                      }}
                      className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90"
                    >
                      Réessayer
                    </button>
                    <Link
                      href={`/projects/${projectId}`}
                      className="block w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center"
                    >
                      Retour au projet
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Informations supplémentaires */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  <Info className="w-5 h-5 inline-block mr-2" />
                  Comment ça marche
                </h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">1. Sélectionnez un montant</span> - Choisissez combien vous souhaitez contribuer
                  </p>
                  <p>
                    <span className="font-medium">2. Payez avec Cardano</span> - Envoyez les ADA à l'adresse fournie
                  </p>
                  <p>
                    <span className="font-medium">3. Confirmation automatique</span> - La transaction est vérifiée sur la blockchain
                  </p>
                  <p>
                    <span className="font-medium">4. Suivez le projet</span> - Recevez des mises à jour sur l'avancement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

// Composant Calendar pour l'icône
function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

// Composant Copy pour l'icône
function Copy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

// Composant Info pour l'icône
function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}