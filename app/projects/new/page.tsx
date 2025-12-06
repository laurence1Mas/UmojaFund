"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Circle,
  DollarSign, 
  Calendar, 
  Users, 
  MapPin, 
  FileText, 
  Tag,
  Plus,
  X,
  Clock,
  TrendingUp,
  Save,
  ArrowLeft,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Info
} from "lucide-react"
import { useApi } from "@/lib/hooks/useApi"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"

interface TeamMember {
  name: string
  role: string
  experience: string
}

interface TimelinePhase {
  phase: string
  duration: string
  activities: string[]
}

export default function NewProject() {
  const router = useRouter()
  const { fetchApi, isLoading } = useApi()
  const { user } = useAuth()
  
  // États pour le multistep
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // États du formulaire
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    story: "",
    category: "education",
    fundingGoal: 60000,
    minInvestment: 10,
    expectedROI: 15,
    startDate: "",
    endDate: "",
    duration: 12,
    deadline: "",
    imageUrl: "",
    pdfUrl: "",
    location: "",
    beneficiaries: 100,
    jobsCreated: 5,
    risks: "",
    tags: [] as string[],
    socialMedia: {
      website: "",
      twitter: ""
    }
  })

  const [team, setTeam] = useState<TeamMember[]>([
    { name: "", role: "", experience: "" }
  ])
  
  const [timeline, setTimeline] = useState<TimelinePhase[]>([
    { phase: "", duration: "", activities: [""] }
  ])
  
  const [currentTag, setCurrentTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Catégories disponibles
  const categories = [
    { value: "education", label: "Éducation & Formation" },
    { value: "technology", label: "Technologie & Innovation" },
    { value: "agriculture", label: "Agriculture" },
    { value: "health", label: "Santé" },
    { value: "energy", label: "Énergie" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "environment", label: "Environnement" },
    { value: "commerce", label: "Commerce & PME" },
    { value: "art", label: "Art & Culture" },
    { value: "social", label: "Social & Communautaire" }
  ]

  // Steps configuration
  const steps = [
    {
      id: 0,
      title: "Informations de base",
      icon: FileText,
      description: "Les informations principales de votre projet",
      validate: () => validateStep(0)
    },
    {
      id: 1,
      title: "Financement",
      icon: DollarSign,
      description: "Objectifs financiers et investissement",
      validate: () => validateStep(1)
    },
    {
      id: 2,
      title: "Détails du projet",
      icon: MapPin,
      description: "Localisation et impact",
      validate: () => validateStep(2)
    },
    {
      id: 3,
      title: "Équipe",
      icon: Users,
      description: "Votre équipe et ses compétences",
      validate: () => true // Optionnel
    },
    {
      id: 4,
      title: "Planning",
      icon: Calendar,
      description: "Calendrier et phases du projet",
      validate: () => true // Optionnel
    },
    {
      id: 5,
      title: "Médias & Tags",
      icon: Tag,
      description: "Images, documents et catégories",
      validate: () => true // Optionnel
    },
    {
      id: 6,
      title: "Confirmation",
      icon: CheckCircle,
      description: "Vérifiez et confirmez votre projet",
      validate: () => true
    }
  ]

  // Gestion des dates
  const today = new Date().toISOString().split('T')[0]
  const minEndDate = formData.startDate ? formData.startDate : today

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name.includes('fundingGoal') || name.includes('minInvestment') || 
                name.includes('expectedROI') || name.includes('duration') ||
                name.includes('beneficiaries') || name.includes('jobsCreated') 
                ? parseInt(value) || 0 
                : value
      }))
    }
    
    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleTeamChange = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...team]
    newTeam[index][field] = value
    setTeam(newTeam)
  }

  const addTeamMember = () => {
    setTeam([...team, { name: "", role: "", experience: "" }])
  }

  const removeTeamMember = (index: number) => {
    if (team.length > 1) {
      const newTeam = [...team]
      newTeam.splice(index, 1)
      setTeam(newTeam)
    }
  }

  const handleTimelineChange = (index: number, field: keyof TimelinePhase, value: string | string[]) => {
    const newTimeline = [...timeline]
    if (field === 'activities' && Array.isArray(value)) {
      newTimeline[index].activities = value
    } else if (typeof value === 'string') {
      newTimeline[index] = { ...newTimeline[index], [field]: value }
    }
    setTimeline(newTimeline)
  }

  const handleActivityChange = (phaseIndex: number, activityIndex: number, value: string) => {
    const newTimeline = [...timeline]
    newTimeline[phaseIndex].activities[activityIndex] = value
    setTimeline(newTimeline)
  }

  const addTimelinePhase = () => {
    setTimeline([...timeline, { phase: "", duration: "", activities: [""] }])
  }

  const removeTimelinePhase = (index: number) => {
    if (timeline.length > 1) {
      const newTimeline = [...timeline]
      newTimeline.splice(index, 1)
      setTimeline(newTimeline)
    }
  }

  const addActivity = (phaseIndex: number) => {
    const newTimeline = [...timeline]
    newTimeline[phaseIndex].activities.push("")
    setTimeline(newTimeline)
  }

  const removeActivity = (phaseIndex: number, activityIndex: number) => {
    const newTimeline = [...timeline]
    if (newTimeline[phaseIndex].activities.length > 1) {
      newTimeline[phaseIndex].activities.splice(activityIndex, 1)
      setTimeline(newTimeline)
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Validation des étapes
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0: // Informations de base
        if (!formData.title.trim()) newErrors.title = "Le titre est requis"
        if (!formData.shortDescription.trim()) newErrors.shortDescription = "La description courte est requise"
        if (!formData.description.trim()) newErrors.description = "La description complète est requise"
        break
        
      case 1: // Financement
        if (!formData.fundingGoal || formData.fundingGoal <= 0) newErrors.fundingGoal = "L'objectif de financement doit être supérieur à 0"
        if (!formData.startDate) newErrors.startDate = "La date de début est requise"
        if (!formData.endDate) newErrors.endDate = "La date de fin est requise"
        if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
          newErrors.endDate = "La date de fin doit être après la date de début"
        }
        break
        
      case 2: // Détails du projet
        if (!formData.location.trim()) newErrors.location = "La localisation est requise"
        break
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0 && !completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step])
    }
    
    return Object.keys(newErrors).length === 0
  }

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 2) { // -2 pour exclure la confirmation
        setCurrentStep(prev => prev + 1)
      } else {
        setIsReviewMode(true)
        setCurrentStep(steps.length - 1) // Aller à la confirmation
      }
    }
  }

  const prevStep = () => {
    if (isReviewMode) {
      setIsReviewMode(false)
      setCurrentStep(steps.length - 2) // Retour à la dernière étape de formulaire
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step < currentStep || completedSteps.includes(step)) {
      setCurrentStep(step)
      setIsReviewMode(false)
    }
  }

  // Soumission du formulaire
const handleSubmit = async () => {
  if (!confirmed) {
    setErrors({ submit: "Veuillez confirmer que toutes les informations sont correctes" })
    return
  }

  setIsSubmitting(true)
  setSuccessMessage("")
  setErrors({})

  try {
    // S'assurer que toutes les dates sont correctement formatées
    const today = new Date().toISOString()
    const startDate = formData.startDate 
      ? new Date(formData.startDate).toISOString() 
      : new Date().toISOString()
    
    const endDate = formData.endDate 
      ? new Date(formData.endDate).toISOString() 
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    
    const deadline = formData.endDate 
      ? new Date(formData.endDate).toISOString() 
      : endDate

    // Préparer les données pour l'API exactement comme attendu
    const projectData = {
      title: formData.title.trim(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      story: formData.story.trim(),
      category: formData.category,
      creatorId: user?._id || user?.id,
      creatorName: user?.name || "Anonymous",
      fundingGoal: Number(formData.fundingGoal),
      minInvestment: Number(formData.minInvestment),
      expectedROI: Number(formData.expectedROI),
      startDate: startDate,
      endDate: endDate,
      duration: Number(formData.duration),
      deadline: deadline,
      imageUrl: formData.imageUrl.trim(),
      pdfUrl: formData.pdfUrl.trim(),
      location: formData.location.trim(),
      beneficiaries: Number(formData.beneficiaries),
      jobsCreated: Number(formData.jobsCreated),
      risks: formData.risks.trim(),
      tags: formData.tags,
      team: team.filter(member => member.name.trim() && member.role.trim()),
      timeline: timeline.filter(phase => phase.phase.trim() && phase.duration.trim()),
      socialMedia: {
        website: formData.socialMedia.website.trim(),
        twitter: formData.socialMedia.twitter.trim()
      }
    }

    console.log("Données envoyées à l'API:", JSON.stringify(projectData, null, 2))

    const response = await fetchApi('/projects', {
      method: 'POST',
      body: projectData,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log("Réponse de l'API:", response)

    if (response.success) {
      setSuccessMessage("Projet créé avec succès !")
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/projects/${response.data?._id || response.data?.id}`)
      }, 2000)
    } else {
      // Gérer les erreurs de validation spécifiquement
      if (response.missingFields && Array.isArray(response.missingFields)) {
        const missing = response.missingFields.join(', ')
        setErrors({ 
          submit: `Champs manquants ou invalides: ${missing}. Veuillez vérifier vos informations.` 
        })
        
        // Mettre en évidence les champs manquants
        response.missingFields.forEach(field => {
          setErrors(prev => ({ ...prev, [field]: `Ce champ est requis` }))
        })
        
      } else if (response.validationErrors) {
        // Gérer les erreurs de validation par champ
        Object.entries(response.validationErrors).forEach(([field, message]) => {
          setErrors(prev => ({ ...prev, [field]: message }))
        })
        setErrors(prev => ({ 
          ...prev, 
          submit: "Veuillez corriger les erreurs dans le formulaire" 
        }))
        
      } else {
        // Erreur générale
        setErrors({ 
          submit: response.error || response.message || "Erreur lors de la création du projet" 
        })
      }
    }
  } catch (error: any) {
    console.error("Erreur complète:", error)
    setErrors({ 
      submit: error.message || "Erreur inattendue lors de la création" 
    })
  } finally {
    setIsSubmitting(false)
  }
}

  // Calcul de la progression
  const progress = ((currentStep + 1) / steps.length) * 100

  // Formatage pour l'affichage
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non défini"
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Composant de la barre de progression
  const ProgressBar = () => (
    <div className="mb-8">
      {/* Barre de progression */}
      <div className="h-2 bg-gray-200 rounded-full mb-4">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Étapes */}
      <div className="flex justify-between">
        {steps.slice(0, -1).map((step, index) => {
          const StepIcon = step.icon
          const isActive = index === currentStep
          const isCompleted = completedSteps.includes(index)
          const isClickable = index < currentStep || completedSteps.includes(index)
          
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && goToStep(index)}
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${isActive ? 'bg-primary text-white ring-4 ring-primary/20' : 
                  isCompleted ? 'bg-green-100 text-green-600' : 
                  'bg-gray-100 text-gray-400'}
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span className={`
                text-xs font-medium
                ${isActive ? 'text-primary' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-500'}
              `}>
                {step.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Composant de la section de formulaire
  const StepContent = () => {
    switch (currentStep) {
      case 0: // Informations de base
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du projet *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Centre de Formation en Informatique à Kinshasa"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description courte *
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Résumé de votre projet en 1-2 phrases"
                rows={2}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={200}
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description complète *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre projet en détail..."
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre histoire
              </label>
              <textarea
                name="story"
                value={formData.story}
                onChange={handleInputChange}
                placeholder="Pourquoi ce projet est important pour vous et votre communauté..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 1: // Financement
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objectif de financement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectif de financement (ADA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="fundingGoal"
                  value={formData.fundingGoal}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.fundingGoal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute left-4 top-3.5 text-gray-500">₳</span>
              </div>
              {errors.fundingGoal && (
                <p className="mt-1 text-sm text-red-600">{errors.fundingGoal}</p>
              )}
            </div>

            {/* Investissement minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investissement minimum (ADA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="minInvestment"
                  value={formData.minInvestment}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute left-4 top-3.5 text-gray-500">₳</span>
              </div>
            </div>

            {/* ROI attendu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ROI attendu (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="expectedROI"
                  value={formData.expectedROI}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <TrendingUp className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (mois)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={today}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={minEndDate}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>
        )

      case 2: // Détails du projet
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: Kinshasa, RDC"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Bénéficiaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de bénéficiaires
              </label>
              <input
                type="number"
                name="beneficiaries"
                value={formData.beneficiaries}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Emplois créés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emplois créés
              </label>
              <input
                type="number"
                name="jobsCreated"
                value={formData.jobsCreated}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Risques */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gestion des risques
              </label>
              <textarea
                name="risks"
                value={formData.risks}
                onChange={handleInputChange}
                placeholder="Décrivez les risques potentiels et comment vous les gérez..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )

      case 3: // Équipe
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Membres de l'équipe</h3>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4" />
                Ajouter un membre
              </button>
            </div>

            {team.map((member, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Membre #{index + 1}</h4>
                  {team.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                      placeholder="Nom complet"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleTeamChange(index, 'role', e.target.value)}
                      placeholder="Ex: Développeur"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expérience
                    </label>
                    <input
                      type="text"
                      value={member.experience}
                      onChange={(e) => handleTeamChange(index, 'experience', e.target.value)}
                      placeholder="Ex: 5 ans d'expérience"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 4: // Planning
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Phases du projet</h3>
              <button
                type="button"
                onClick={addTimelinePhase}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4" />
                Ajouter une phase
              </button>
            </div>

            {timeline.map((phase, phaseIndex) => (
              <div key={phaseIndex} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Phase #{phaseIndex + 1}</h4>
                  {timeline.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimelinePhase(phaseIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la phase
                    </label>
                    <input
                      type="text"
                      value={phase.phase}
                      onChange={(e) => handleTimelineChange(phaseIndex, 'phase', e.target.value)}
                      placeholder="Ex: Phase 1 - Installation"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée
                    </label>
                    <input
                      type="text"
                      value={phase.duration}
                      onChange={(e) => handleTimelineChange(phaseIndex, 'duration', e.target.value)}
                      placeholder="Ex: 2 mois"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Activités
                    </label>
                    <button
                      type="button"
                      onClick={() => addActivity(phaseIndex)}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      + Ajouter une activité
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {phase.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => handleActivityChange(phaseIndex, activityIndex, e.target.value)}
                          placeholder="Ex: Aménagement des locaux"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        {phase.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeActivity(phaseIndex, activityIndex)}
                            className="px-3 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 5: // Médias & Tags
        return (
          <div className="space-y-6">
            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image principale
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lien vers une image de votre projet (1200x630 pixels recommandé)
              </p>
            </div>

            {/* PDF URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL du document PDF
              </label>
              <input
                type="url"
                name="pdfUrl"
                value={formData.pdfUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/projet.pdf"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Ajouter
                </button>
              </div>
              
              {/* Liste des tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Réseaux sociaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  name="socialMedia.website"
                  value={formData.socialMedia.website}
                  onChange={handleInputChange}
                  placeholder="https://votre-site.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter / X
                </label>
                <input
                  type="text"
                  name="socialMedia.twitter"
                  value={formData.socialMedia.twitter}
                  onChange={handleInputChange}
                  placeholder="@nom_dutilisateur"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      case 6: // Confirmation
        return (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Vérification finale</h4>
                  <p className="text-sm text-blue-700">
                    Veuillez vérifier attentivement toutes les informations ci-dessous avant de publier votre projet.
                  </p>
                </div>
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Récapitulatif du projet</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations de base */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Informations de base</h4>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{formData.title}</p>
                      <p className="text-gray-600 mt-1">{formData.shortDescription}</p>
                      <p className="text-gray-500 mt-2">{formData.category}</p>
                    </div>
                  </div>

                  {/* Financement */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Financement</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Objectif:</span>
                        <span className="font-medium">{formatCurrency(formData.fundingGoal)} ADA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investissement min:</span>
                        <span className="font-medium">{formData.minInvestment} ADA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI attendu:</span>
                        <span className="font-medium text-green-600">{formData.expectedROI}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dates:</span>
                        <span className="font-medium">{formatDate(formData.startDate)} → {formatDate(formData.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Localisation</h4>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{formData.location}</p>
                      <div className="flex gap-4 mt-2 text-gray-600">
                        <span>👥 {formData.beneficiaries} bénéficiaires</span>
                        <span>💼 {formData.jobsCreated} emplois</span>
                      </div>
                    </div>
                  </div>

                  {/* Équipe */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Équipe</h4>
                    <div className="text-sm space-y-2">
                      {team.filter(m => m.name.trim()).map((member, index) => (
                        <div key={index} className="text-gray-600">
                          <span className="font-medium">{member.name}</span> - {member.role}
                        </div>
                      ))}
                      {team.filter(m => m.name.trim()).length === 0 && (
                        <p className="text-gray-500">Aucun membre d'équipe ajouté</p>
                      )}
                    </div>
                  </div>

                  {/* Médias */}
                  <div className="space-y-3 md:col-span-2">
                    <h4 className="font-medium text-gray-700">Médias & Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {formData.imageUrl && (
                      <p className="text-sm text-gray-600 mt-2">Image: {formData.imageUrl.substring(0, 50)}...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirm"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="confirm" className="text-sm text-gray-700">
                    Je confirme que toutes les informations ci-dessus sont exactes et complètes.
                    Je comprends que mon projet sera soumis à modération avant publication.
                  </label>
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-red-800 font-medium">{errors.submit}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-green-800 font-medium">{successMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à mes projets
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Créer un nouveau projet
              </h1>
              <p className="text-gray-600">
                Étape {currentStep + 1} sur {steps.length} - {steps[currentStep]?.title}
              </p>
            </div>
            
            {currentStep < steps.length - 1 && (
              <div className="text-sm text-gray-500">
                {completedSteps.length} sur {steps.length - 2} étapes complétées
              </div>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <ProgressBar />

        {/* Section du formulaire */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          {/* En-tête de l'étape */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            {(() => {
              const StepIcon = steps[currentStep]?.icon
              return StepIcon ? <StepIcon className="w-7 h-7 text-primary" /> : null
            })()}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {steps[currentStep]?.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {steps[currentStep]?.description}
              </p>
            </div>
          </div>

          {/* Contenu de l'étape */}
          <div className="py-4">
            <StepContent />
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-t-xl shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {currentStep < steps.length - 1 ? (
                <>
                  {currentStep < steps.length - 2 && (
                    <button
                      type="button"
                      onClick={() => setIsReviewMode(true)}
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      <Eye className="inline w-4 h-4 mr-1" />
                      Prévisualiser
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !confirmed}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publication en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Publier le projet
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            * Champs requis - Vous pouvez revenir aux étapes précédentes pour modifier vos informations
          </p>
        </div>
      </div>
    </div>
  )
}