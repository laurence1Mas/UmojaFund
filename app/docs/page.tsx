"use client"
import Link from "next/link"
import { 
  BookOpen, 
  Code, 
  Database, 
  Shield, 
  Wallet, 
  Users,
  FileText,
  Video,
  Download,
  ExternalLink
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function DocumentationPage() {
  const sections = [
    {
      title: "Getting Started",
      description: "Begin your journey with UmojaFund",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      guides: [
        { title: "Quick Start Guide", level: "Beginner", time: "10 min" },
        { title: "Account Setup", level: "Beginner", time: "5 min" },
        { title: "Platform Tour", level: "Beginner", time: "15 min" },
      ]
    },
    {
      title: "API Reference",
      description: "Integrate with our platform",
      icon: Code,
      color: "bg-green-100 text-green-600",
      guides: [
        { title: "Authentication", level: "Advanced", time: "20 min" },
        { title: "Projects API", level: "Advanced", time: "30 min" },
        { title: "Webhooks", level: "Advanced", time: "25 min" },
      ]
    },
    {
      title: "Security",
      description: "Keep your data safe",
      icon: Shield,
      color: "bg-red-100 text-red-600",
      guides: [
        { title: "Best Practices", level: "Intermediate", time: "15 min" },
        { title: "Two-Factor Auth", level: "Beginner", time: "5 min" },
        { title: "API Security", level: "Advanced", time: "20 min" },
      ]
    },
    {
      title: "Wallet",
      description: "Manage your funds",
      icon: Wallet,
      color: "bg-purple-100 text-purple-600",
      guides: [
        { title: "Wallet Setup", level: "Beginner", time: "10 min" },
        { title: "Transactions", level: "Intermediate", time: "15 min" },
        { title: "Withdrawals", level: "Intermediate", time: "10 min" },
      ]
    },
    {
      title: "Community",
      description: "Engage with others",
      icon: Users,
      color: "bg-orange-100 text-orange-600",
      guides: [
        { title: "Community Guidelines", level: "Beginner", time: "5 min" },
        { title: "Moderation", level: "Intermediate", time: "10 min" },
        { title: "Contributing", level: "Beginner", time: "8 min" },
      ]
    },
    {
      title: "Legal",
      description: "Terms and policies",
      icon: FileText,
      color: "bg-gray-100 text-gray-600",
      guides: [
        { title: "Terms of Service", level: "All", time: "30 min" },
        { title: "Privacy Policy", level: "All", time: "25 min" },
        { title: "GDPR Compliance", level: "Advanced", time: "20 min" },
      ]
    }
  ]

  const resources = [
    {
      title: "API Playground",
      description: "Test our API endpoints in real-time",
      icon: Code,
      link: "/api-playground"
    },
    {
      title: "SDK Downloads",
      description: "Client libraries for various languages",
      icon: Download,
      link: "/sdk"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: Video,
      link: "/tutorials"
    },
    {
      title: "GitHub Repository",
      description: "Open source components and examples",
      icon: ExternalLink,
      link: "https://github.com/umojafund",
      external: true
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive guides, API references, and resources to help you build with UmojaFund
            </p>
            
            {/* Quick Stats */}
            <div className="inline-flex items-center space-x-6 mt-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Database size={16} />
                <span>Last updated: Dec 5, 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span>45+ articles</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="search"
                placeholder="Search documentation..."
                className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Search
              </button>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {section.guides.map((guide) => (
                      <Link
                        key={guide.title}
                        href="#"
                        className="block p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium group-hover:text-primary">{guide.title}</h4>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {guide.level}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Read time: {guide.time}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional Resources */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource) => {
                const Icon = resource.icon
                return (
                  <a
                    key={resource.title}
                    href={resource.link}
                    target={resource.external ? "_blank" : undefined}
                    rel={resource.external ? "noopener noreferrer" : undefined}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm">{resource.description}</p>
                    {resource.external && (
                      <div className="flex items-center space-x-1 mt-3 text-sm text-primary">
                        <ExternalLink size={14} />
                        <span>External link</span>
                      </div>
                    )}
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
                <p className="text-gray-700 mb-6">
                  Get up and running with UmojaFund in just a few minutes. Follow our step-by-step guide to create your first project or make your first contribution.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Create your account</h4>
                      <p className="text-sm text-gray-600">Sign up and verify your email</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Set up your wallet</h4>
                      <p className="text-sm text-gray-600">Add payment methods and verify</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Explore or create</h4>
                      <p className="text-sm text-gray-600">Browse projects or create your own</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Need Help?</h3>
                <div className="space-y-4">
                  <a href="/contact" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Contact Support</h4>
                      <p className="text-sm text-gray-600">Get personalized assistance</p>
                    </div>
                  </a>
                  <a href="/faq" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Browse FAQ</h4>
                      <p className="text-sm text-gray-600">Find quick answers</p>
                    </div>
                  </a>
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