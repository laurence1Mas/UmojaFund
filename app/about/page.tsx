
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle, Users, Target, Globe, Shield, Zap, Heart, Sparkles } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function About() {
  const { t } = useLanguage()
  const [counters, setCounters] = useState({
    projects: 0,
    members: 0,
    raised: 0,
    success: 0
  })

  const stats = [
    {
      label: t.about.projectsFunded,
      value: "500+",
      icon: <Target className="w-6 h-6" />,
      target: 500
    },
    {
      label: t.about.communityMembers,
      value: "50K+",
      icon: <Users className="w-6 h-6" />,
      target: 50000
    },
    {
      label: t.about.totalRaised,
      value: "5M+ Ada",
      icon: <Sparkles className="w-6 h-6" />,
      target: 5000000
    },
    {
      label: t.about.successRate,
      value: "85%",
      icon: <Heart className="w-6 h-6" />,
      target: 85
    },
  ]

  const team = [
    
    {
      name: "Marcelin Mulezi",
      role: "Team Leader",
      image: "/team/marcelin.jpg",
      department: "Direction"
    },
    {
      name: "Laurence Masika",
      role: "Fullstack Developer",
      image: "/team/laure.jpg",
      department: "Technique"
    },
    {
      name: "Robert Kule",
      role: "Software Developer",
      image: "/team/robert.jpg",
      department: "Technique"
    },
    {
      name: "Christophe",
      role: "Community Manager",
      image: "/team/pic-1.png",
      department: "Marketing"
    },
    {
      name: "Jean-Claude Magugu",
      role: "Secrétaire",
      image: "/team/jean-claude.jpg",
      department: "Administration"
    },
    {
      name: "Pablo Balondani",
      role: "Secrétaire",
      image: "/team/pablo.jpg",
      department: "Testeur"
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => ({
        projects: Math.min(prev.projects + 25, 500),
        members: Math.min(prev.members + 2500, 50000),
        raised: Math.min(prev.raised + 250000, 5000000),
        success: Math.min(prev.success + 4, 85)
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/20 to-white">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero avec dégradé et animation */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white py-20"
        >
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              {t.about.title}
            </motion.h1>
            <motion.p
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed"
            >
              {t.about.subtitle}
            </motion.p>
          </div>
        </motion.section>

        {/* Mission & Vision avec cartes modernes */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                {...fadeInUp}
                className="group bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-8 shadow-lg shadow-blue-100/50 border border-blue-100/30 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300"
              >
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {t.about.mission}
                  </h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {t.about.missionText}
                </p>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="group bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-8 shadow-lg shadow-purple-100/50 border border-purple-100/30 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300"
              >
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    {t.about.vision}
                  </h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {t.about.visionText}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats avec compteurs animés */}
        <section className="py-20 bg-gradient-to-b from-white to-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {index === 0 ? counters.projects.toLocaleString() + '+' :
                      index === 1 ? counters.members.toLocaleString() + '+' :
                        index === 2 ? (counters.raised / 1000000).toFixed(1) + 'M+' :
                          counters.success + '%'}
                  </div>
                  <div className="text-gray-600 mt-2 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact avec icônes colorées */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent"
            >
              {t.about.impact}
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: t.about.environmental,
                  desc: t.about.environmentalDesc,
                  icon: <Globe className="w-6 h-6" />,
                  color: "from-emerald-500 to-teal-600"
                },
                {
                  title: t.about.education,
                  desc: t.about.educationDesc,
                  icon: <Users className="w-6 h-6" />,
                  color: "from-blue-500 to-indigo-600"
                },
                {
                  title: t.about.development,
                  desc: t.about.developmentDesc,
                  icon: <Zap className="w-6 h-6" />,
                  color: "from-orange-500 to-red-600"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {/* {React.cloneElement(item.icon, { className: "w-8 h-8 text-white" })} */}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values & Commitments avec design symétrique */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent"
            >
              {t.about.values}
            </motion.h2>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* VALUES */}
              <motion.div
                {...fadeInUp}
                className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-8 shadow-xl shadow-blue-100/50 border border-blue-100/50"
              >
                <div className="absolute -top-3 left-8 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  {t.about.values}
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    t.about.valueTransparency,
                    t.about.valueEquity,
                    t.about.valueInnovation,
                    t.about.valueImpact,
                    t.about.valueAccessibility
                  ].map((value, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-gray-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* COMMITMENTS */}
              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-8 shadow-xl shadow-purple-100/50 border border-purple-100/50"
              >
                <div className="absolute -top-3 left-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  {t.about.commitmentsTitle}
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    t.about.commitment1,
                    t.about.commitment2,
                    t.about.commitment3,
                    t.about.commitment4,
                    t.about.commitment5
                  ].map((commitment, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{commitment}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why UmojaFund */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
            >
              {t.about.whyTitle}
            </motion.h2>

            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                {...fadeInUp}
                className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{t.about.whyRealitiesTitle}</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{t.about.whyRealitiesDesc}</p>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{t.about.whyTrustTitle}</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{t.about.whyTrustDesc}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* UmojaFund & Cardano */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent"
            >
              {t.about.cardanoTitle}
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: "🔒",
                  title: t.about.cardanoSecurity.split(':')[0],
                  desc: t.about.cardanoSecurity.split(':')[1],
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: "⚙",
                  title: t.about.cardanoAutomation.split(':')[0],
                  desc: t.about.cardanoAutomation.split(':')[1],
                  gradient: "from-purple-500 to-pink-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`text-3xl mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-700 mt-12 text-lg max-w-2xl mx-auto leading-relaxed bg-gradient-to-r from-blue-600/20 to-purple-500/10 p-6 rounded-2xl"
            >
              {t.about.cardanoAccessibility}
            </motion.p>
          </div>
        </section>

        {/* Team avec cartes interactives */}
        <section className="py-20 bg-gradient-to-b from-muted/50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
            >
              {t.about.team}
            </motion.h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center"
                >
                  <div className="relative w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-white shadow-lg group-hover:ring-primary/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20" />
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-2xl">
                        {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    {member.department}
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-gray-600 text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}