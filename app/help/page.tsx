"use client"
import Link from "next/link"
import { Search, MessageCircle, BookOpen, Video, Phone, Mail } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HelpCenter() {
  const categories = [
    {
      title: "Getting Started",
      description: "New to UmojaFund? Start here",
      icon: BookOpen,
      articles: [
        "Creating your account",
        "Setting up your wallet",
        "Finding projects to support",
        "Making your first contribution",
      ]
    },
    {
      title: "Contributions",
      description: "Everything about funding projects",
      icon: MessageCircle,
      articles: [
        "How contributions work",
        "Managing your contributions",
        "Contribution rewards",
        "Canceling a contribution",
      ]
    },
    {
      title: "Projects",
      description: "For project creators",
      icon: Video,
      articles: [
        "Creating a project",
        "Project guidelines",
        "Managing funded projects",
        "Project completion",
      ]
    },
    {
      title: "Wallet",
      description: "Managing your funds",
      icon: BookOpen,
      articles: [
        "Adding funds to wallet",
        "Withdrawing funds",
        "Transaction history",
        "Wallet security",
      ]
    }
  ]

  const popularArticles = [
    { title: "How to reset your password", views: "1.2K" },
    { title: "Understanding project milestones", views: "890" },
    { title: "Troubleshooting wallet issues", views: "756" },
    { title: "Contribution refund policy", views: "654" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Find answers, guides, and tutorials to get the most out of UmojaFund
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search for help articles, guides, or FAQs..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.title} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{category.title}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article}>
                        <Link 
                          href="#" 
                          className="text-gray-700 hover:text-primary flex items-center space-x-2 py-1"
                        >
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{article}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Popular Articles */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {popularArticles.map((article) => (
                <Link
                  key={article.title}
                  href="#"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium group-hover:text-primary">{article.title}</h3>
                    <span className="text-sm text-gray-500">{article.views} views</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Still need help?</h2>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you with any questions or issues you might have.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/contact"
                  className="flex items-center space-x-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
                >
                  <Mail className="text-primary" size={20} />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-gray-600">support@umojafund.com</p>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-xl">
                  <Phone className="text-primary" size={20} />
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Preview */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick FAQ</h3>
              <div className="space-y-4">
                {[
                  "How long does funding take?",
                  "Are there any fees?",
                  "Can I cancel my contribution?",
                  "How are projects verified?"
                ].map((question) => (
                  <div key={question} className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium mb-2">{question}</h4>
                    <p className="text-sm text-gray-600">
                      {question === "How long does funding take?" && "Projects typically get funded within 30-60 days..."}
                      {question === "Are there any fees?" && "We charge a 5% platform fee on successful projects..."}
                      {question === "Can I cancel my contribution?" && "Contributions can be cancelled within 24 hours..."}
                      {question === "How are projects verified?" && "All projects go through a verification process..."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}