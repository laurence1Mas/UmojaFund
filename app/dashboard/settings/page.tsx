"use client"

import { useState, useEffect } from "react"
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Upload,
  Mail,
  Smartphone,
  Globe as LanguageIcon,
  Moon,
  Sun,
  Trash2
} from "lucide-react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useApi } from "@/lib/hooks/useApi"

interface UserProfile {
  name: string
  email: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
}

interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactorEnabled: boolean
}

interface NotificationSettings {
  emailNotifications: boolean
  projectUpdates: boolean
  fundingAlerts: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
  pushNotifications: boolean
}

interface Preferences {
  language: string
  currency: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  dateFormat: string
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { fetchApi, isLoading } = useApi()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'billing'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    avatar: ""
  })

  // Security State
  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    projectUpdates: true,
    fundingAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
    pushNotifications: true
  })

  // Preferences State
  const [preferences, setPreferences] = useState<Preferences>({
    language: "en",
    currency: "ADA",
    timezone: "UTC",
    theme: "system",
    dateFormat: "MM/DD/YYYY"
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }))
    }
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
    clearMessages()
  }

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSecurity(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    clearMessages()
  }

  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNotifications(prev => ({ ...prev, [name]: checked }))
  }

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setPreferences(prev => ({ ...prev, [name]: value }))
  }

  const clearMessages = () => {
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const saveProfile = async () => {
    setIsSaving(true)
    clearMessages()

    try {
      // Simuler appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mettre à jour le contexte auth
      updateUser({
        name: profile.name,
        email: profile.email
      })

      setSuccessMessage("Profile updated successfully!")
    } catch (error) {
      setErrorMessage("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const updatePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setErrorMessage("New passwords don't match")
      return
    }

    if (security.newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters")
      return
    }

    setIsSaving(true)
    clearMessages()

    try {
      // Simuler appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccessMessage("Password updated successfully!")
      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: security.twoFactorEnabled
      })
    } catch (error) {
      setErrorMessage("Failed to update password. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTwoFactor = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSecurity(prev => ({ 
        ...prev, 
        twoFactorEnabled: !prev.twoFactorEnabled 
      }))
    } finally {
      setIsSaving(false)
    }
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simuler upload
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar: reader.result as string }))
      setSuccessMessage("Avatar updated successfully!")
      setIsSaving(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <p className="font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                {/* Avatar Section */}
                <div className="lg:w-1/3">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                        {profile.avatar ? (
                          <img 
                            src={profile.avatar} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-4xl font-bold">
                            {profile.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
                        <Upload size={20} className="text-gray-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={uploadAvatar}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="text-center">
                      <h3 className="font-bold text-lg">{profile.name}</h3>
                      <p className="text-gray-600 text-sm">{profile.email}</p>
                      <p className="text-gray-500 text-xs mt-2">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024'}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="lg:w-2/3">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="john@example.com"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Verified email address</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="+243 973822439"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={profile.location}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="url"
                          name="website"
                          value={profile.website}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Brief description for your profile</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={saveProfile}
                        disabled={isSaving}
                        className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Password Change */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
                <form className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={security.currentPassword}
                        onChange={handleSecurityChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={security.newPassword}
                        onChange={handleSecurityChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={security.confirmPassword}
                        onChange={handleSecurityChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={updatePassword}
                      disabled={isSaving}
                      className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h3>
                    <p className="text-gray-600">
                      {security.twoFactorEnabled 
                        ? "2FA is currently enabled for your account"
                        : "Add an extra layer of security to your account"
                      }
                    </p>
                  </div>
                  <button
                    onClick={toggleTwoFactor}
                    disabled={isSaving}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      security.twoFactorEnabled
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-primary text-white hover:bg-primary/90"
                    } disabled:opacity-50`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : security.twoFactorEnabled ? (
                      "Disable 2FA"
                    ) : (
                      "Enable 2FA"
                    )}
                  </button>
                </div>

                {!security.twoFactorEnabled && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Recommendation:</strong> Enable two-factor authentication for enhanced security.
                      You'll need to verify your identity using an authenticator app.
                    </p>
                  </div>
                )}
              </div>

              {/* Session Management */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Active Sessions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-600">Chrome on Windows • San Francisco, CA</p>
                      <p className="text-xs text-gray-500">Last active: Just now</p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Current
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Mobile Session</p>
                      <p className="text-sm text-gray-600">Safari on iPhone • New York, NY</p>
                      <p className="text-xs text-gray-500">Last active: 2 days ago</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Notification Preferences</h3>
              
              <div className="space-y-8">
                {/* Email Notifications */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-gray-600" />
                    <h4 className="font-bold text-lg">Email Notifications</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium">Project Updates</p>
                        <p className="text-sm text-gray-600">Get updates on projects you've funded</p>
                      </div>
                      <input
                        type="checkbox"
                        name="projectUpdates"
                        checked={notifications.projectUpdates}
                        onChange={handleNotificationsChange}
                        className="w-5 h-5 text-primary rounded"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium">Funding Alerts</p>
                        <p className="text-sm text-gray-600">Notifications when projects reach milestones</p>
                      </div>
                      <input
                        type="checkbox"
                        name="fundingAlerts"
                        checked={notifications.fundingAlerts}
                        onChange={handleNotificationsChange}
                        className="w-5 h-5 text-primary rounded"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-gray-600">Weekly summary of your portfolio</p>
                      </div>
                      <input
                        type="checkbox"
                        name="weeklyDigest"
                        checked={notifications.weeklyDigest}
                        onChange={handleNotificationsChange}
                        className="w-5 h-5 text-primary rounded"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-600">News and promotional offers</p>
                      </div>
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={notifications.marketingEmails}
                        onChange={handleNotificationsChange}
                        className="w-5 h-5 text-primary rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-6 h-6 text-gray-600" />
                    <h4 className="font-bold text-lg">Push Notifications</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium">Enable Push Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                      </div>
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={notifications.pushNotifications}
                        onChange={handleNotificationsChange}
                        className="w-5 h-5 text-primary rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSuccessMessage("Notification preferences saved!")}
                    className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Account Preferences</h3>
              
              <form className="space-y-8 max-w-2xl">
                {/* Language & Region */}
                <div>
                  <h4 className="font-bold text-lg mb-6">Language & Region</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <div className="relative">
                        <LanguageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                          name="language"
                          value={preferences.language}
                          onChange={handlePreferencesChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                          <option value="pt">Português</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        value={preferences.timezone}
                        onChange={handlePreferencesChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <h4 className="font-bold text-lg mb-6">Currency & Format</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={preferences.currency}
                        onChange={handlePreferencesChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
                      >
                        <option value="ADA">Cardano (ADA)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                        <option value="JPY">Japanese Yen (JPY)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        name="dateFormat"
                        value={preferences.dateFormat}
                        onChange={handlePreferencesChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div>
                  <h4 className="font-bold text-lg mb-6">Appearance</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Sun className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">Light Mode</p>
                          <p className="text-sm text-gray-600">White background with dark text</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={preferences.theme === 'light'}
                        onChange={handlePreferencesChange}
                        className="w-5 h-5 text-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-gray-600">Dark background with light text</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={preferences.theme === 'dark'}
                        onChange={handlePreferencesChange}
                        className="w-5 h-5 text-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">System Default</p>
                          <p className="text-sm text-gray-600">Follow your system preferences</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={preferences.theme === 'system'}
                        onChange={handlePreferencesChange}
                        className="w-5 h-5 text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSuccessMessage("Preferences saved successfully!")}
                    className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-8">
              {/* Payment Methods */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Default
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors text-gray-600 hover:text-primary">
                    + Add Payment Method
                  </button>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Billing History</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Project Funding - Clean Water Initiative</p>
                      <p className="text-sm text-gray-600">January 15, 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">500 Ada</p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Platform Fee</p>
                      <p className="text-sm text-gray-600">December 1, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">25 Ada</p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Project Funding - Tech Education</p>
                      <p className="text-sm text-gray-600">November 20, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">300 Ada</p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button className="text-primary hover:text-primary/80 font-medium">
                    View All Transactions
                  </button>
                </div>
              </div>

              {/* Invoices */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Invoices</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Invoice #INV-2025-001</p>
                      <p className="text-sm text-gray-600">January 2025 • 500 Ada</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-primary hover:text-primary/80 font-medium">
                        Download PDF
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Mail size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Invoice #INV-2024-012</p>
                      <p className="text-sm text-gray-600">December 2024 • 25 Ada</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-primary hover:text-primary/80 font-medium">
                        Download PDF
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Mail size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}