"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })

      // Real-time password validation
      if (name === "password") {
        setValidations({
          minLength: value.length >= 8,
          hasUppercase: /[A-Z]/.test(value),
          hasNumber: /\d/.test(value),
          hasSpecial: /[!@#$%^&*]/.test(value),
        })
      }
    }
    setError(null) // Clear error on change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    // Client-side validation
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }
    
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }
    
    if (!formData.password) {
      setError("Password is required")
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (!isPasswordValid) {
      setError("Password does not meet security requirements")
      return
    }
    
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      if (data.success) {
        setSuccess("Account created successfully! Redirecting to login...")
        
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem("umoja_token", data.token)
        }
        
        // Redirect to login or dashboard after 2 seconds
        setTimeout(() => {
          router.push("/auth/login?registered=true")
        }, 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "An error occurred during registration. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPasswordValid = Object.values(validations).every((v) => v)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
              <p className="text-gray-600 mt-2">Join UmojaFund and start supporting projects</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={20} />
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12 transition-all"
                    placeholder="Create a strong password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle 
                      size={16} 
                      className={validations.minLength ? "text-green-500" : "text-gray-300"} 
                    />
                    <span className={validations.minLength ? "text-green-600" : "text-gray-600"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle 
                      size={16} 
                      className={validations.hasUppercase ? "text-green-500" : "text-gray-300"} 
                    />
                    <span className={validations.hasUppercase ? "text-green-600" : "text-gray-600"}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle 
                      size={16} 
                      className={validations.hasNumber ? "text-green-500" : "text-gray-300"} 
                    />
                    <span className={validations.hasNumber ? "text-green-600" : "text-gray-600"}>
                      One number
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle 
                      size={16} 
                      className={validations.hasSpecial ? "text-green-500" : "text-gray-300"} 
                    />
                    <span className={validations.hasSpecial ? "text-green-600" : "text-gray-600"}>
                      One special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12 transition-all"
                    placeholder="Confirm your password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
                    required
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-600 leading-tight">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid || formData.password !== formData.confirmPassword || !formData.agreeToTerms || isSubmitting}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}