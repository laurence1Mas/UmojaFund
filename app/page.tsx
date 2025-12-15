"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Carousel } from "@/components/carousel"
import { motion } from "framer-motion"
import {
  Heart,
  TrendingUp,
  Users,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  Target,
  CheckCircle,
  Zap,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export default function Home() {
  const { t } = useLanguage()

  const carouselSlides = [
    {
      image: "/slide-1.png",
      title: t.home.carouselSlide1Title,
      description: t.home.carouselSlide1Desc,
      buttonText: t.home.exploreProjects,
      buttonLink: "/projects",
    },
    {
      image: "/slide-2.png",
      title: t.home.carouselSlide2Title,
      description: t.home.carouselSlide2Desc,
      buttonText: t.home.startFunding,
      buttonLink: "/auth/register",
    },
    {
      image: "/slide-3.jpg",
      title: t.home.carouselSlide3Title,
      description: t.home.carouselSlide3Desc,
      buttonText: t.home.exploreProjects,
      buttonLink: "/projects",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: t.home.communityFirst,
      description: t.home.communityDesc,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50"
    },
    {
      icon: TrendingUp,
      title: t.home.sustainableGrowth,
      description: t.home.sustainableDesc,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Users,
      title: t.home.transparency,
      description: t.home.transparencyDesc,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
  ]

  const whyItems = [
    {
      icon: Globe,
      title: t.about.whyRealitiesTitle,
      desc: t.about.whyRealitiesDesc,
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: ShieldCheck,
      title: t.about.whyTrustTitle,
      desc: t.about.whyTrustDesc,
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Users,
      title: t.about.whyCommunityTitle,
      desc: t.about.whyCommunityDesc,
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: t.about.whyImpactTitle,
      desc: t.about.whyImpactDesc,
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Heart,
      title: t.about.whyInclusionTitle,
      desc: t.about.whyInclusionDesc,
      color: "from-cyan-500 to-blue-500"
    },
  ]

  const commitments = [
    t.about.commitment1,
    t.about.commitment2,
    t.about.commitment3,
    t.about.commitment4,
    t.about.commitment5,
  ]

  // Variants d'animation
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/20 to-white">
      <Navbar />

      {/* HERO - Carousel conservé */}
      <section className="pt-16">
        <Carousel slides={carouselSlides} autoPlay interval={6000} showOverlay overlayOpacity={45} />
      </section>

      {/* ABOUT SECTION */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Image Container avec animations */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              {/* Image principale */}
              <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/50 border-4 border-white">
                <img
                  src="/slide-2.png"
                  alt={t.home.aboutTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent" />

                {/* Badge animé */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-sm"
                >
                  {t.home.trusted}
                </motion.div>
              </div>

              {/* Image secondaire (mobile) */}
              <div className="lg:hidden mt-8 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-40 h-48 bg-white rounded-2xl shadow-xl border-2 border-blue-100 flex items-center justify-center p-4"
                >
                  <img
                    src="/logo-img.png"
                    alt="UmojaFund"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </div>

              {/* Image secondaire (desktop) */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:block absolute -right-10 -bottom-10 w-56 h-72 bg-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white" />
                <img
                  src="/logo-img.png"
                  alt="UmojaFund"
                  className="w-full h-full object-contain p-6"
                />
              </motion.div>
            </motion.div>

            {/* Texte */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
              className="order-1 lg:order-2 space-y-6"
            >
              <div>
                <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                  {t.home.aboutUs}
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {t.home.aboutTitle}
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t.home.aboutDesc}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t.home.aboutDesc2}
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-4"
              >
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
                >
                  {t.home.learnMore}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                  <Sparkles className="w-4 h-4" />
                  {t.home.whyChooseUs}
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent leading-tight">
                  {t.home.mainTagline}
                </h2>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed">
                {t.home.introText}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-200 transition-all duration-300"
                  >
                    {t.home.exploreProjects}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-200 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                  >
                    {t.home.startFunding}
                    <TrendingUp className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Content - Cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {commitments.map((item, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-blue-100/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed group-hover:text-blue-900 transition-colors">
                      {item}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY UMOJAFUND */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
              {t.home.advantages}
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-6">
              {t.about.whyTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.home.whySubtitle}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {whyItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-blue-100/50 transition-all duration-300"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed flex-grow">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="py-20 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
              {t.home.ourPrinciples}
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-6">
              {t.home.valuesTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.home.valuesSubtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-blue-100/50 group-hover:shadow-2xl transition-all duration-300">
                    <div className="mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {value.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>

                    {/* Divider décoratif */}
                    <div className="mt-8 pt-6 border-t border-blue-100">
                      <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${value.color}`} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-2xl shadow-blue-200/50">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t.home.readyToStart}
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                {t.home.joinCommunity}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
                  >
                    {t.home.browseProjects}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-2 bg-blue-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-all"
                  >
                    {t.home.getStarted}
                    <Zap className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}