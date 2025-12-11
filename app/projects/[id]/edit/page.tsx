"use client"

import { useState, useRef, useEffect,useCallback} from "react"
import React from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
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
  Image,
  File,
  Trash2,
  Loader,
  Info,
  Globe,
  Twitter,
  Shield,
  ClipboardCheck,
  Sparkles,
  Target,
  BarChart3
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

interface UploadedFile {
  id: string
  name: string
  type: 'image' | 'pdf' | 'other'
  size: number
  url: string
  file?: File
}

interface ProjectData {
  title: string
  shortDescription: string
  description: string
  story: string
  category: string
  fundingGoal: number
  minInvestment: number
  expectedROI: number
  startDate: string
  endDate: string
  duration: number
  location: string
  beneficiaries: number
  jobsCreated: number
  risks: string
  tags: string[]
  socialMedia: { website: string; twitter: string }
  images: string[]
  documents: string[]
  team: TeamMember[]
  timeline: TimelinePhase[]
}

export default function EditProject() {
  const router = useRouter()
  const params = useParams()
  const { fetchApi } = useApi()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  
  const projectId = params.id as string

  // États pour le multistep
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // États du formulaire
  const [formData, setFormData] = useState<ProjectData>({
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
    location: "",
    beneficiaries: 100,
    jobsCreated: 5,
    risks: "",
    tags: [],
    socialMedia: { website: "", twitter: "" },
    images: [],
    documents: [],
    team: [{ name: "", role: "", experience: "" }],
    timeline: [{ phase: "", duration: "", activities: [""] }],
  })
  
  const [team, setTeam] = useState<TeamMember[]>([{ name: "", role: "", experience: "" }])
  const [timeline, setTimeline] = useState<TimelinePhase[]>([{ phase: "", duration: "", activities: [""] }])
  const [currentTag, setCurrentTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // États pour l'upload de fichiers
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImageUrl, setSelectedImageUrl] = useState("")
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("")

  // Chargement initial
  const [loading, setLoading] = useState(true)

  // Catégories
  const categories = [
    { value: "education", label: "Éducation & Formation", icon: "📚" },
    { value: "technology", label: "Technologie & Innovation", icon: "💻" },
    { value: "agriculture", label: "Agriculture", icon: "🌾" },
    { value: "health", label: "Santé", icon: "🏥" },
    { value: "energy", label: "Énergie", icon: "⚡" },
    { value: "infrastructure", label: "Infrastructure", icon: "🏗️" },
    { value: "environment", label: "Environnement", icon: "🌱" },
    { value: "commerce", label: "Commerce & PME", icon: "🏪" },
    { value: "art", label: "Art & Culture", icon: "🎨" },
    { value: "social", label: "Social & Communautaire", icon: "🤝" }
  ]

  const steps = [
    { id: 0, title: "Informations de base", icon: FileText, requiredFields: ['title', 'shortDescription', 'description'] },
    { id: 1, title: "Financement", icon: DollarSign, requiredFields: ['fundingGoal', 'startDate', 'endDate'] },
    { id: 2, title: "Détails du projet", icon: MapPin, requiredFields: ['location'] },
    { id: 3, title: "Équipe", icon: Users, requiredFields: [] },
    { id: 4, title: "Planning", icon: Calendar, requiredFields: [] },
    { id: 5, title: "Médias & Documents", icon: Image, requiredFields: [] },
    { id: 6, title: "Confirmation", icon: ClipboardCheck, requiredFields: [] }
  ]

  const today = new Date().toISOString().split('T')[0]
  const minEndDate = formData.startDate ? formData.startDate : today

  // Charger le projet existant
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true)
        const response = await fetchApi(`/projects/${projectId}`)
        if (response.success && response.data) {
          const p = response.data as ProjectData
          // Remplir formData
          setFormData({
            title: p.title || "",
            shortDescription: p.shortDescription || "",
            description: p.description || "",
            story: p.story || "",
            category: p.category || "education",
            fundingGoal: p.fundingGoal || 60000,
            minInvestment: p.minInvestment || 10,
            expectedROI: p.expectedROI || 15,
            startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : "",
            endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : "",
            duration: p.duration || 12,
            location: p.location || "",
            beneficiaries: p.beneficiaries || 100,
            jobsCreated: p.jobsCreated || 5,
            risks: p.risks || "",
            tags: p.tags || [],
            socialMedia: {
              website: p.socialMedia?.website || "",
              twitter: p.socialMedia?.twitter || ""
            },
            images: p.images || [],
            documents: p.documents || [],
            team: p.team?.length ? p.team : [{ name: "", role: "", experience: "" }],
            timeline: p.timeline?.length ? p.timeline : [{ phase: "", duration: "", activities: [""] }]
          })
          // Équipe
          setTeam(p.team?.length ? p.team : [{ name: "", role: "", experience: "" }])
          // Planning
          setTimeline(p.timeline?.length ? p.timeline : [{ phase: "", duration: "", activities: [""] }])
          // Médias
          setUploadedImages((p.images || []).map((url: string, i: number) => ({
            id: `img-${i}`,
            name: `image-${i}.jpg`,
            type: 'image',
            size: 0,
            url
          })))
          setUploadedDocuments((p.documents || []).map((url: string, i: number) => ({
            id: `doc-${i}`,
            name: `document-${i}.pdf`,
            type: 'pdf',
            size: 0,
            url
          })))
          setSelectedImageUrl(p.images?.[0] || "")
          setSelectedPdfUrl(p.documents?.[0] || "")
        }
      } catch (err) {
        console.error("Erreur chargement projet:", err)
        router.push("/projects")
      } finally {
        setLoading(false)
      }
    }
    if (projectId) loadProject()
  }, [projectId, fetchApi, router])

  // === Handlers identiques à NewProject ===
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadFile = async (file: File, type: 'image' | 'pdf'): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(URL.createObjectURL(file)), 500)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { /* identique */ }
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { /* identique */ }
  const removeImage = (id: string) => { /* identique */ }
  const removeDocument = (id: string) => { /* identique */ }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      if (name.includes('.')) {
        const [parent, child] = name.split('.')
        setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent as keyof typeof prev] as any, [child]: value }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: ['fundingGoal','minInvestment','expectedROI','duration','beneficiaries','jobsCreated'].includes(name)
            ? parseInt(value) || 0
            : value
        }))
      }
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    }, [errors])


  const handleTeamChange = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...team]
    newTeam[index] = { ...newTeam[index], [field]: value }
    setTeam(newTeam)
  }

  const addTeamMember = () => setTeam([...team, { name: "", role: "", experience: "" }])
  const removeTeamMember = (index: number) => {
    if (team.length > 1) setTeam(team.filter((_, i) => i !== index))
  }

  const handleTimelineChange = (index: number, field: keyof TimelinePhase, value: string) => {
    const newTimeline = [...timeline]
    newTimeline[index] = { ...newTimeline[index], [field]: value }
    setTimeline(newTimeline)
  }

  const handleActivityChange = (phaseIndex: number, activityIndex: number, value: string) => {
    const newTimeline = [...timeline]
    newTimeline[phaseIndex].activities[activityIndex] = value
    setTimeline(newTimeline)
  }

  const addTimelinePhase = () => setTimeline([...timeline, { phase: "", duration: "", activities: [""] }])
  const removeTimelinePhase = (index: number) => {
    if (timeline.length > 1) setTimeline(timeline.filter((_, i) => i !== index))
  }

  const addActivity = (phaseIndex: number) => {
    const newTimeline = [...timeline]
    newTimeline[phaseIndex].activities.push("")
    setTimeline(newTimeline)
  }

  const removeActivity = (phaseIndex: number, activityIndex: number) => {
    const newTimeline = [...timeline]
    if (newTimeline[phaseIndex].activities.length > 1) {
      newTimeline[phaseIndex].activities = newTimeline[phaseIndex].activities.filter((_, i) => i !== activityIndex)
      setTimeline(newTimeline)
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

    // Validation locale de l'étape courante
const validateCurrentStep = () => {
  const step = steps[currentStep]
  const newErrors: Record<string, string> = {}
  step.requiredFields.forEach(field => {
    const value = formData[field as keyof typeof formData]
    if (!value || (typeof value === 'string' && !value.trim())) {
      newErrors[field] = "Ce champ est requis"
    }
  })
  // Validation spécifique pour certaines étapes
  if (currentStep === 1) {
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "La date de fin doit être après la date de début"
    }
    if (formData.fundingGoal <= 0) {
      newErrors.fundingGoal = "L'objectif de financement doit être supérieur à 0"
    }
  }
  setErrors(newErrors)
  if (Object.keys(newErrors).length === 0 && !completedSteps.includes(currentStep)) {
    setCompletedSteps(prev => [...prev, currentStep])
  }
  return Object.keys(newErrors).length === 0
}

// Navigation entre les étapes
const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep < steps.length - 2) {
      setCurrentStep(prev => prev + 1)
    } else {
      setCurrentStep(steps.length - 1)
    }
  }
}

const prevStep = () => {
  if (currentStep > 0) {
    setCurrentStep(prev => prev - 1)
  }
}

const goToStep = (step: number) => {
  if (step < currentStep || completedSteps.includes(step)) {
    setCurrentStep(step)
  }
}

// Validation finale complète
const validateAllSteps = () => {
  const newErrors: Record<string, string> = {}
  // Valider toutes les étapes
  steps.forEach(step => {
    step.requiredFields.forEach(field => {
      const value = formData[field as keyof typeof formData]
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field] = "Ce champ est requis"
      }
    })
  })
  // Validation supplémentaire
  if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
    newErrors.endDate = "La date de fin doit être après la date de début"
  }
  if (!user) {
    newErrors.submit = "Vous devez être connecté pour créer un projet"
  }
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

  // Soumission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSuccessMessage("")
    try {
      // Préparer les données
      const projectData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: timeline.filter(t => t.phase.trim() && t.duration.trim()),
        team: team.filter(m => m.name.trim() && m.role.trim()),
        images: uploadedImages.map(img => img.url),
        documents: uploadedDocuments.map(doc => doc.url),
      }

      const response = await fetchApi(`/projects/${projectId}`, {
        method: 'PUT',
        body: projectData,
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.success) {
        setSuccessMessage("Projet mis à jour avec succès !")
        setTimeout(() => router.push(`/projects/${projectId}`), 2000)
      } else {
        setErrors({ submit: response.error || "Erreur lors de la mise à jour" })
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "Erreur inattendue" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // UI helpers
  const progress = ((currentStep + 1) / steps.length) * 100
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount)
  const formatDate = (dateString: string) => {
    if (!dateString) return "Non défini"
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="h-2 bg-gray-200 rounded-full mb-4">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
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
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-default'} group`}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-white ring-4 ring-primary/20 scale-110' : 
                  isCompleted ? 'bg-green-100 text-green-600' : 
                  'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span className={`
                text-xs font-medium transition-colors
                ${isActive ? 'text-primary font-semibold' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-500 group-hover:text-gray-700'}
              `}>
                {step.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
    const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Confirmer la publication
          </h3>
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir soumettre ce projet ? 
            Il sera examiné par notre équipe avant publication.
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Processus de modération</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Vérification des informations dans les 24-48h</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Validation des documents et images</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Notification par email une fois approuvé</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">État du projet :</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              En attente de modération
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Date de soumission :</span>
            <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmationModal(false)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            disabled={isSubmitting}
          >
            Revenir
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi...
              </div>
            ) : (
              "Confirmer et soumettre"
            )}
          </button>
        </div>
      </div>
    </div>
  )
  // ==============================
  // 🟢 ÉTAPES SÉPARÉES EN COMPOSANTS
  // ==============================
  
  // --- Étape 0 : Informations de base
  const Step0 = React.memo(({ formData, handleInputChange, errors, categories }: {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Record<string, string>;
    categories: { value: string; label: string; icon: string }[];
  }) => (
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
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.title}
          </p>
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
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.shortDescription ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={200}
        />
        {errors.shortDescription && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.shortDescription}
          </p>
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
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.description}
          </p>
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map(category => (
            <label
              key={category.value}
              className={`relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                formData.category === category.value
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={category.value}
                checked={formData.category === category.value}
                onChange={handleInputChange}
                className="sr-only"
              />
              <span className="text-2xl">{category.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{category.label}</div>
              </div>
              {formData.category === category.value && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  ));
  
  // --- Étape 1 : Financement
  const Step1 = React.memo(({ formData, handleInputChange, errors, today, minEndDate }: {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Record<string, string>;
    today: string;
    minEndDate: string;
  }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              step="1000"
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.fundingGoal ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="absolute left-4 top-3.5 text-gray-500">₳</span>
          </div>
          {errors.fundingGoal && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.fundingGoal}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Objectif minimum recommandé : 10 000 ADA
          </p>
        </div>
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
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
            <span className="absolute left-4 top-3.5 text-gray-500">₳</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Permet aux petits investisseurs de participer
          </p>
        </div>
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
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
            <TrendingUp className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Rendement annuel moyen estimé
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée du projet (mois)
          </label>
          <div className="relative">
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
            <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.startDate}
            </p>
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.endDate}
            </p>
          )}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Conseils de financement</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Fixez un objectif réaliste et justifié</li>
              <li>• Définissez des paliers de financement (milestones)</li>
              <li>• Les projets de 3-12 mois ont plus de succès</li>
              <li>• Prévoyez une marge de sécurité de 15-20%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ));
  
  // --- Étape 2 : Détails du projet
  const Step2 = React.memo(({ formData, handleInputChange, errors }: {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Record<string, string>;
  }) => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Localisation du projet *
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Ex: Kinshasa, République Démocratique du Congo"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.location}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de bénéficiaires directs
          </label>
          <div className="relative">
            <input
              type="number"
              name="beneficiaries"
              value={formData.beneficiaries}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
            <Users className="absolute right-4 top-3.5 w-5 h-5 text-gray-500" />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Personnes qui bénéficieront directement du projet
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emplois créés
          </label>
          <div className="relative">
            <input
              type="number"
              name="jobsCreated"
              value={formData.jobsCreated}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
            <Sparkles className="absolute right-4 top-3.5 w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Analyse des risques et atténuation
        </label>
        <textarea
          name="risks"
          value={formData.risks}
          onChange={handleInputChange}
          placeholder="Décrivez les principaux risques identifiés et vos stratégies pour les gérer..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />
        <p className="mt-1 text-xs text-gray-500">
          Ex: risques financiers, logistiques, réglementaires, etc.
        </p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800 mb-1">Impact social</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Précisez comment votre projet répond à un besoin local</li>
              <li>• Décrivez l'impact à long terme sur la communauté</li>
              <li>• Mentionnez les partenaires locaux impliqués</li>
              <li>• Indiquez comment vous mesurerez le succès</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ));
  
  // --- Étape 3 : Équipe
  const Step3 = React.memo(({ team, handleTeamChange, addTeamMember, removeTeamMember }: {
    team: TeamMember[];
    handleTeamChange: (index: number, field: keyof TeamMember, value: string) => void;
    addTeamMember: () => void;
    removeTeamMember: (index: number) => void;
  }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Membres de l'équipe</h3>
          <p className="text-sm text-gray-600">Présentez les personnes qui portent ce projet</p>
        </div>
        <button
          type="button"
          onClick={addTeamMember}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un membre
        </button>
      </div>
      {team.map((member, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-xl bg-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium text-gray-900">Membre #{index + 1}</h4>
            </div>
            {team.length > 1 && (
              <button
                type="button"
                onClick={() => removeTeamMember(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                placeholder="Prénom Nom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle dans le projet</label>
              <input
                type="text"
                value={member.role}
                onChange={(e) => handleTeamChange(index, 'role', e.target.value)}
                placeholder="Ex: Coordinateur, Développeur, Expert..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expérience pertinente</label>
              <input
                type="text"
                value={member.experience}
                onChange={(e) => handleTeamChange(index, 'experience', e.target.value)}
                placeholder="Ex: 5 ans dans le domaine, diplôme..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ));
  
  // --- Étape 4 : Planning
  const Step4 = React.memo(({ timeline, handleTimelineChange, handleActivityChange, addTimelinePhase, removeTimelinePhase, addActivity, removeActivity }: {
    timeline: TimelinePhase[];
    handleTimelineChange: (index: number, field: keyof TimelinePhase, value: string) => void;
    handleActivityChange: (phaseIndex: number, activityIndex: number, value: string) => void;
    addTimelinePhase: () => void;
    removeTimelinePhase: (index: number) => void;
    addActivity: (phaseIndex: number) => void;
    removeActivity: (phaseIndex: number, activityIndex: number) => void;
  }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Phases du projet</h3>
          <p className="text-sm text-gray-600">Détaillez les différentes étapes de réalisation</p>
        </div>
        <button
          type="button"
          onClick={addTimelinePhase}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une phase
        </button>
      </div>
      {timeline.map((phase, phaseIndex) => (
        <div key={phaseIndex} className="p-4 border border-gray-200 rounded-xl bg-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium text-gray-900">Phase #{phaseIndex + 1}</h4>
            </div>
            {timeline.length > 1 && (
              <button
                type="button"
                onClick={() => removeTimelinePhase(phaseIndex)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la phase</label>
              <input
                type="text"
                value={phase.phase}
                onChange={(e) => handleTimelineChange(phaseIndex, 'phase', e.target.value)}
                placeholder="Ex: Phase 1 - Installation et préparation"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée estimée</label>
              <input
                type="text"
                value={phase.duration}
                onChange={(e) => handleTimelineChange(phaseIndex, 'duration', e.target.value)}
                placeholder="Ex: 2 mois, 3 semaines..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Activités principales</label>
              <button
                type="button"
                onClick={() => addActivity(phaseIndex)}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter une activité
              </button>
            </div>
            <div className="space-y-2">
              {phase.activities.map((activity, activityIndex) => (
                <div key={activityIndex} className="flex gap-2">
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => handleActivityChange(phaseIndex, activityIndex, e.target.value)}
                    placeholder="Ex: Aménagement des locaux, formation des équipes..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                  {phase.activities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActivity(phaseIndex, activityIndex)}
                      className="px-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
  ));
  
  // --- Étape 5 : Médias & Documents
  const Step5 = React.memo(({ 
    formData, 
    handleInputChange, 
    currentTag, 
    setCurrentTag, 
    handleAddTag, 
    handleKeyPress, 
    removeTag, 
    uploadedImages, 
    uploadedDocuments, 
    selectedImageUrl, 
    selectedPdfUrl, 
    setSelectedImageUrl, 
    setSelectedPdfUrl, 
    imageInputRef, 
    fileInputRef, 
    handleImageUpload, 
    handleDocumentUpload, 
    removeImage, 
    removeDocument, 
    isUploading, 
    uploadProgress, 
    errors, 
    formatFileSize 
  }: any) => (
    <div className="space-y-8">
      {/* Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Images du projet</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Télécharger des images</label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50/50 hover:bg-gray-50"
            onClick={() => imageInputRef.current?.click()}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-1">
                <span className="font-medium text-primary">Cliquez pour télécharger</span> ou glissez-déposez
              </p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF jusqu'à 5MB</p>
            </div>
          </div>
          {errors.images && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.images}
            </p>
          )}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <Loader className="w-5 h-5 text-primary animate-spin" />
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Téléchargement en cours... {uploadProgress}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
        {uploadedImages.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Images téléchargées ({uploadedImages.length})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <div 
                  key={image.id} 
                  className={`relative group border-2 rounded-xl overflow-hidden transition-all ${
                    selectedImageUrl === image.url ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="aspect-square bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedImageUrl(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedImageUrl === image.url && (
                    <div className="absolute top-2 left-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  <div className="p-2 bg-white/90 backdrop-blur-sm">
                    <p className="text-xs font-medium truncate">{image.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
            {selectedImageUrl && (
              <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Image principale sélectionnée
              </div>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ou utiliser une URL d'image</label>
          <input
            type="url"
            value={selectedImageUrl}
            onChange={(e) => setSelectedImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>
      </div>
  
      {/* PDF */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Télécharger un document PDF</label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50/50 hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleDocumentUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <File className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-1">
                <span className="font-medium text-primary">Cliquez pour télécharger</span> ou glissez-déposez
              </p>
              <p className="text-sm text-gray-500">PDF uniquement, jusqu'à 10MB</p>
            </div>
          </div>
          {errors.documents && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.documents}
            </p>
          )}
        </div>
        {uploadedDocuments.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Documents téléchargés ({uploadedDocuments.length})
            </label>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${
                    selectedPdfUrl === doc.url ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{doc.name}</p>
                        {selectedPdfUrl === doc.url && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Sélectionné</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPdfUrl !== doc.url && (
                      <button
                        type="button"
                        onClick={() => setSelectedPdfUrl(doc.url)}
                        className="px-3 py-1 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        Sélectionner
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ou utiliser une URL de PDF</label>
          <input
            type="url"
            value={selectedPdfUrl}
            onChange={(e) => setSelectedPdfUrl(e.target.value)}
            placeholder="https://example.com/projet.pdf"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>
      </div>
  
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ajouter un tag (ex: innovation, agriculture, santé...)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
          >
            Ajouter
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                #{tag}
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
        {formData.tags.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">Les tags aident les investisseurs à trouver votre projet</p>
        )}
      </div>
  
      {/* Réseaux sociaux */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Liens sociaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Site web
              </div>
            </label>
            <input
              type="url"
              name="socialMedia.website"
              value={formData.socialMedia.website}
              onChange={handleInputChange}
              placeholder="https://votre-site.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-gray-500" />
                Twitter / X
              </div>
            </label>
            <input
              type="text"
              name="socialMedia.twitter"
              value={formData.socialMedia.twitter}
              onChange={handleInputChange}
              placeholder="@nom_dutilisateur"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  ));
  
  // --- Étape 6 : Confirmation (identique, pas de saisie)
  const Step6 = React.memo(({ 
    formData, 
    team, 
    timeline, 
    uploadedImages, 
    uploadedDocuments, 
    errors, 
    categories, 
    formatDate, 
    formatCurrency 
  }: any) => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">Vérification finale</h4>
            <p className="text-gray-600">
              Vérifiez attentivement toutes les informations avant de soumettre votre projet pour modération.
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Informations générales
              </h4>
              <div className="space-y-3">
                <div><p className="text-sm text-gray-600">Titre</p><p className="font-medium">{formData.title || "Non spécifié"}</p></div>
                <div><p className="text-sm text-gray-600">Description courte</p><p className="font-medium">{formData.shortDescription || "Non spécifiée"}</p></div>
                <div>
                  <p className="text-sm text-gray-600">Catégorie</p>
                  <p className="font-medium flex items-center gap-2">
                    <span className="text-xl">{categories.find(c => c.value === formData.category)?.icon}</span>
                    {categories.find(c => c.value === formData.category)?.label}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Localisation & Impact
              </h4>
              <div className="space-y-3">
                <div><p className="text-sm text-gray-600">Localisation</p><p className="font-medium">{formData.location || "Non spécifiée"}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg"><p className="text-sm text-gray-600">Bénéficiaires</p><p className="font-bold text-lg">{formData.beneficiaries}</p></div>
                  <div className="bg-gray-50 p-3 rounded-lg"><p className="text-sm text-gray-600">Emplois créés</p><p className="font-bold text-lg">{formData.jobsCreated}</p></div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Équipe
              </h4>
              <div className="space-y-2">
                {team.filter((m: any) => m.name.trim()).map((member: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                ))}
                {team.filter((m: any) => m.name.trim()).length === 0 && (
                  <p className="text-gray-500 text-sm italic">Aucun membre d'équipe ajouté</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Financement
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-sm text-gray-600">Objectif</p>
                    <p className="font-bold text-lg">{formatCurrency(formData.fundingGoal)} ADA</p>
                  </div>
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-sm text-gray-600">Invest. min</p>
                    <p className="font-bold text-lg">{formData.minInvestment} ADA</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl border border-primary/10">
                  <p className="text-sm text-gray-600">ROI attendu</p>
                  <p className="font-bold text-lg text-green-600">{formData.expectedROI}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Période de financement</p>
                  <p className="font-medium">{formatDate(formData.startDate)} → {formatDate(formData.endDate)}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Planning
              </h4>
              <div className="space-y-3">
                <div><p className="text-sm text-gray-600">Durée totale</p><p className="font-medium">{formData.duration} mois</p></div>
                <div className="space-y-2">
                  {timeline.filter((t: any) => t.phase.trim()).map((phase: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{phase.phase}</p>
                      <p className="text-sm text-gray-600">{phase.duration}</p>
                    </div>
                  ))}
                  {timeline.filter((t: any) => t.phase.trim()).length === 0 && (
                    <p className="text-gray-500 text-sm italic">Aucune phase définie</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Médias
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><p className="text-sm text-gray-600">Images</p><p className="font-medium">{uploadedImages.length} téléchargée(s)</p></div>
                <div className="flex items-center justify-between"><p className="text-sm text-gray-600">Documents PDF</p><p className="font-medium">{uploadedDocuments.length} téléchargé(s)</p></div>
                {formData.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in-0">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-800 font-medium">{errors.submit}</span>
            </div>
          </div>
        )}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">À propos du processus de modération</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Votre projet sera examiné dans les 24-48 heures</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Vous recevrez une notification par email du résultat</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>En cas de modifications requises, vous pourrez éditer votre projet</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Une fois approuvé, votre projet sera visible publiquement</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
  // 🔑 RENDU DE L'ÉTAPE SÉLECTIONNÉE
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <Step0 formData={formData} handleInputChange={handleInputChange} errors={errors} categories={categories} />
      case 1: return <Step1 formData={formData} handleInputChange={handleInputChange} errors={errors} today={today} minEndDate={minEndDate} />
      case 2: return <Step2 formData={formData} handleInputChange={handleInputChange} errors={errors} />
      case 3: return <Step3 team={team} handleTeamChange={handleTeamChange} addTeamMember={addTeamMember} removeTeamMember={removeTeamMember} />
      case 4: return <Step4 
        timeline={timeline}
        handleTimelineChange={handleTimelineChange}
        handleActivityChange={handleActivityChange}
        addTimelinePhase={addTimelinePhase}
        removeTimelinePhase={removeTimelinePhase}
        addActivity={addActivity}
        removeActivity={removeActivity}
      />
      case 5: return <Step5
        formData={formData}
        handleInputChange={handleInputChange}
        currentTag={currentTag}
        setCurrentTag={setCurrentTag}
        handleAddTag={handleAddTag}
        handleKeyPress={handleKeyPress}
        removeTag={removeTag}
        uploadedImages={uploadedImages}
        uploadedDocuments={uploadedDocuments}
        selectedImageUrl={selectedImageUrl}
        selectedPdfUrl={selectedPdfUrl}
        setSelectedImageUrl={setSelectedImageUrl}
        setSelectedPdfUrl={setSelectedPdfUrl}
        imageInputRef={imageInputRef}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        handleDocumentUpload={handleDocumentUpload}
        removeImage={removeImage}
        removeDocument={removeDocument}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        errors={errors}
        formatFileSize={formatFileSize}
      />
      case 6: return <Step6
        formData={formData}
        team={team}
        timeline={timeline}
        uploadedImages={uploadedImages}
        uploadedDocuments={uploadedDocuments}
        errors={errors}
        categories={categories}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Retour au projet</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Modifier le projet
              </h1>
              <p className="text-gray-600">
                Mettez à jour les informations de votre projet
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <ProgressBar />
          <div className="py-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                {(() => {
                  const StepIcon = steps[currentStep]?.icon
                  return StepIcon ? <StepIcon className="w-6 h-6 text-primary" /> : null
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep]?.title}</h2>
                <p className="text-gray-600">{steps[currentStep]?.description}</p>
              </div>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {renderStepContent()}
            </div>
          </div>
        </div>

        {/* Footer identique à NewProject */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-t-2xl shadow-lg backdrop-blur-sm bg-white/95">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              {currentStep > 0 && (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" /> Étape précédente
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-medium hover:opacity-90">
                  {currentStep === steps.length - 2 ? "Voir le récapitulatif" : "Continuer"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl">
            {successMessage}
          </div>
        </div>
      )}
    </div>
  )
}