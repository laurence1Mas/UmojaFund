"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export default function About() {
  const { t } = useLanguage()

  const stats = [
    { label: t.about.projectsFunded, value: "500+" },
    { label: t.about.communityMembers, value: "50K+" },
    { label: t.about.totalRaised, value: "5M+ Ada" },
    { label: t.about.successRate, value: "85%" },
  ]

  const team = [
    { name: "Laurence Masika", role: "Fullstack Developer (Technique)", image: "/team/laure.jpg" },
    { name: "Marcelin Mulezi", role: "Team Leader", image: "/team/pic-1.png" },
    { name: "Robert Kule", role: "Software Developer (Technique)", image: "/team/pic-1.png" },
    { name: "Christophe", role: "Community Manager", image: "/team/pic-1.png" },
    { name: "Jean-Claude", role: "Secrétaire", image: "/team/pic-1.png" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.about.title}</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t.about.subtitle}</p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">{t.about.mission}</h2>
                <p className="text-gray-600">{t.about.missionText}</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">{t.about.vision}</h2>
                <p className="text-gray-600">{t.about.visionText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">{t.about.impact}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">{t.about.environmental}</h3>
                <p className="text-gray-600">{t.about.environmentalDesc}</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">{t.about.education}</h3>
                <p className="text-gray-600">{t.about.educationDesc}</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">{t.about.development}</h3>
                <p className="text-gray-600">{t.about.developmentDesc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">{t.about.values}</h2>
            <ul className="max-w-3xl mx-auto text-gray-700 space-y-3 list-disc pl-6">
              <li>{t.about.valueTransparency}</li>
              <li>{t.about.valueEquity}</li>
              <li>{t.about.valueInnovation}</li>
              <li>{t.about.valueImpact}</li>
              <li>{t.about.valueAccessibility}</li>
            </ul>
          </div>
        </section>

        {/* Why UmojaFund */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">{t.about.whyTitle}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-2">{t.about.whyRealitiesTitle}</h3>
                <p className="text-gray-600">{t.about.whyRealitiesDesc}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">{t.about.whyTrustTitle}</h3>
                <p className="text-gray-600">{t.about.whyTrustDesc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitments */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">{t.about.commitmentsTitle}</h2>
            <ul className="max-w-3xl mx-auto text-gray-700 space-y-3 list-disc pl-6">
              <li>{t.about.commitment1}</li>
              <li>{t.about.commitment2}</li>
              <li>{t.about.commitment3}</li>
              <li>{t.about.commitment4}</li>
              <li>{t.about.commitment5}</li>
            </ul>
          </div>
        </section>

        {/* UmojaFund & Cardano */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">{t.about.cardanoTitle}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="font-bold mb-2">🔒 {t.about.cardanoSecurity.split(':')[0]}</h3>
                <p className="text-gray-600 text-sm">{t.about.cardanoSecurity.split(':')[1]}</p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="font-bold mb-2">⚙ {t.about.cardanoAutomation.split(':')[0]}</h3>
                <p className="text-gray-600 text-sm">{t.about.cardanoAutomation.split(':')[1]}</p>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-6">{t.about.cardanoAccessibility}</p>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">{t.about.team}</h2>
            <div className="grid md:grid-cols-5 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-20 h-20 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center bg-primary/10 text-primary font-semibold">
                        {member.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-gray-600 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
