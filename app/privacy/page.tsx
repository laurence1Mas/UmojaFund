"use client"
import { Shield, Lock, Eye, Download } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly, information from third parties, and automatically collected information through cookies and similar technologies."
    },
    {
      title: "How We Use Your Information",
      content: "To provide and improve our services, communicate with you, ensure security, and comply with legal obligations."
    },
    {
      title: "Information Sharing",
      content: "We may share information with service providers, legal authorities when required, and with your consent."
    },
    {
      title: "Your Rights",
      content: "You have rights to access, correct, delete, and restrict processing of your personal data."
    },
    {
      title: "Data Security",
      content: "We implement industry-standard security measures to protect your information from unauthorized access."
    },
    {
      title: "Contact Us",
      content: "For privacy-related questions, contact our Data Protection Officer at privacy@umojafund.com"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="text-primary" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-600">
              Last updated: December 5, 2024
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center mb-12">
            <a
              href="/privacy.pdf"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              <span>Download PDF Version</span>
            </a>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg">
              At UmojaFund, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 mb-12">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {idx === 0 && <Lock size={20} className="text-primary" />}
                    {idx === 1 && <Eye size={20} className="text-primary" />}
                    {idx === 2 && <Shield size={20} className="text-primary" />}
                    {idx > 2 && <span className="font-bold text-primary">{idx + 1}</span>}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                    <p className="text-gray-700">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Update Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-2">Policy Updates</h3>
            <p className="text-blue-700">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}