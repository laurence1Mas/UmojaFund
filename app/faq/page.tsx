"use client"

import { useState } from "react"
import { Search, ChevronDown, BookOpen, Wallet, Users, Shield } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function FAQPage() {
  const [openSection, setOpenSection] = useState<string | null>("general")
  const [searchQuery, setSearchQuery] = useState("")

  const faqCategories = [
    {
      id: "general",
      title: "General",
      icon: BookOpen,
      questions: [
        {
          question: "What is UmojaFund?",
          answer: "UmojaFund is a crowdfunding platform that empowers communities by connecting innovative projects with supporters. We focus on projects that create positive social impact."
        },
        {
          question: "How does UmojaFund work?",
          answer: "Project creators submit their ideas, which are reviewed and published. Supporters can browse projects and make contributions. Once a project reaches its funding goal, funds are released to the creator."
        },
        {
          question: "Is UmojaFund available worldwide?",
          answer: "Yes! Anyone can contribute to projects from anywhere in the world. Project creation is available in most countries, with some restrictions based on local regulations."
        }
      ]
    },
    {
      id: "contributing",
      title: "Contributing",
      icon: Wallet,
      questions: [
        {
          question: "How do I make a contribution?",
          answer: "Browse projects, select one you want to support, choose your contribution amount, and complete the payment process. You can use various payment methods including crypto and traditional payments."
        },
        {
          question: "Can I get a refund?",
          answer: "Contributions can be refunded within 24 hours of making them. After that, refunds are only available if the project fails to reach its funding goal or is cancelled by the creator."
        },
        {
          question: "What are contribution rewards?",
          answer: "Many projects offer rewards to contributors based on their contribution level. These can include early access, exclusive content, merchandise, or special acknowledgments."
        }
      ]
    },
    {
      id: "projects",
      title: "Projects",
      icon: Users,
      questions: [
        {
          question: "How do I create a project?",
          answer: "Sign up for an account, go to your dashboard, and click 'Create Project'. You'll need to provide project details, funding goal, timeline, and any rewards for contributors."
        },
        {
          question: "What types of projects are allowed?",
          answer: "We support creative, innovative, and socially beneficial projects. Prohibited categories include illegal activities, hate speech, and purely personal funding requests."
        },
        {
          question: "How long does project review take?",
          answer: "Our team typically reviews projects within 2-3 business days. You'll receive email notifications throughout the review process."
        }
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      questions: [
        {
          question: "How secure is my payment information?",
          answer: "We use bank-level encryption and never store full payment details. All transactions are processed through PCI-compliant payment processors."
        },
        {
          question: "Is my personal information safe?",
          answer: "Yes. We adhere to strict privacy policies and only share necessary information. You control what's visible on your public profile."
        },
        {
          question: "How do I secure my account?",
          answer: "We recommend using a strong password, enabling two-factor authentication, and being cautious of phishing attempts. Never share your login credentials."
        }
      ]
    }
  ]

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 text-lg mb-8">
              Find answers to common questions about UmojaFund
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">Projects Funded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24h</div>
                <div className="text-sm text-gray-600">Avg. Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredFAQs.map((category) => {
              const Icon = category.icon
              const isOpen = openSection === category.id
              
              return (
                <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => setOpenSection(isOpen ? null : category.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="text-primary" size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg">{category.title}</h3>
                        <p className="text-sm text-gray-500">
                          {category.questions.length} questions
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Questions */}
                  {isOpen && (
                    <div className="border-t border-gray-200">
                      {category.questions.map((item, idx) => (
                        <div key={idx} className="border-b border-gray-100 last:border-b-0">
                          <div className="p-6">
                            <h4 className="font-bold text-gray-900 mb-3">{item.question}</h4>
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Still Have Questions */}
          <div className="mt-12 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="mb-6 opacity-90">
                Can't find what you're looking for? Our support team is ready to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/help"
                  className="px-6 py-3 border-2 border-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Visit Help Center
                </a>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Creating your first project: A step-by-step guide",
                "Understanding contribution rewards and tiers",
                "Security best practices for your account",
                "How to maximize your project's visibility"
              ].map((title, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
                  <p className="text-sm text-gray-600">
                    Learn more about this topic with our detailed guide...
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}