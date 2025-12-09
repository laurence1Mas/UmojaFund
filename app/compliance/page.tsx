"use client"
import { ShieldCheck, FileCheck, Globe } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function CompliancePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Compliance</h1>
            <p className="text-gray-600">Our commitment to regulatory standards</p>
          </div>
          {/* Contenu compliance... */}
        </div>
      </main>
      <Footer />
    </div>
  )
}