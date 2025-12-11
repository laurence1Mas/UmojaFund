"use client";

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Carousel } from "@/components/carousel"
import { Heart, TrendingUp, Users, ArrowRight } from "lucide-react"
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
    },
    {
      icon: TrendingUp,
      title: t.home.sustainableGrowth,
      description: t.home.sustainableDesc,
    },
    {
      icon: Users,
      title: t.home.transparency,
      description: t.home.transparencyDesc,
    },
  ]

  const recentProjects = [
    {
      id: 1,
      title: "Clean Water Initiative",
      category: "Environment",
      progress: 75,
      raised: 15000,
      goal: 20000,
      image: "/clean-water-project.jpg",
    },
    {
      id: 2,
      title: "Tech Education Program",
      category: "Education",
      progress: 45,
      raised: 9000,
      goal: 20000,
      image: "/tech-education.jpg",
    },
    {
      id: 3,
      title: "Community Garden",
      category: "Agriculture",
      progress: 90,
      raised: 18000,
      goal: 20000,
      image: "/community-garden.jpg",
    },
  ]

  const steps = [
    {
      number: "1",
      title: t.home.step1,
      description: t.home.step1Desc,
    },
    {
      number: "2",
      title: t.home.step2,
      description: t.home.step2Desc,
    },
    {
      number: "3",
      title: t.home.step3,
      description: t.home.step3Desc,
    },
    {
      number: "4",
      title: t.home.step4,
      description: t.home.step4Desc,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="w-full relative pt-16">
        <Carousel
          slides={carouselSlides}
          autoPlay
          interval={6000}
          showOverlay
          overlayOpacity={45}
        />
      </section>
      {/* About Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.home.aboutTitle}</h2>
              <p className="text-gray-600 mb-4">
                {t.home.aboutDesc}
              </p>
              <p className="text-gray-600">
                {t.home.aboutDesc2}
              </p>
            </div>
            <div>
              <img
                src="/logo-img.png"
                alt={t.home.aboutTitle}
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>  
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.home.valuesTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.home.recentProjects}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold flex-1">{project.title}</h3>
                    <span className="text-xs bg-secondary/10 text-primary px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {project.raised.toLocaleString()} Ada of {project.goal.toLocaleString()} Ada
                    </p>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary font-medium hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                  >
                    {t.home.learnMore} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.home.howItWorks}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works Section – TIMELINE */}
<section className="py-20 bg-linear-60 from-white to-muted">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
      How It Works
    </h2>

    <div className="relative">
      {/* Ligne horizontale */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-primary/30 transform -translate-y-1/2"></div>

      {/* Steps */}
      <div className="grid grid-cols-4 relative">
        {steps.map((step, index) => {
          const isEven = (index + 1) % 2 === 0

          return (
            <div
              key={index}
              className={`flex flex-col items-center text-center relative transition-all duration-300 
                hover:scale-105 hover:text-primary hover:drop-shadow-lg hover:bg-white hover:p-4 hover:rounded-2xl animate-[float_3s_ease-in-out_infinite]
                ${isEven ? "mb-20" : "mt-20"}
              `}
            >
              {/* Ligne verticale */}
              <div
                className={`absolute w-1 bg-primary ${
                  isEven ? "bottom-0 h-20" : "top-0 h-20"
                }`}
              />

              {/* Contenu texte + numéro */}
              {isEven ? (
                // PAIRS → Contenu en haut, numéro en bas
                <>
                  <div className="max-w-[160px] mb-8">
                    <h3 className="text-lg font-bold mb-1 text-primary">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>

                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg z-10 shadow-md">
                    {step.number}
                  </div>
                </>
              ) : (
                // IMPAIRS → Numéro en haut, contenu en bas
                <>
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg z-10 shadow-md mb-8">
                    {step.number}
                  </div>

                  <div className="max-w-[160px]">
                    <h3 className="text-lg font-bold mb-1 text-primary">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  </div>
</section>

<style jsx>{`
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }
`}</style>


      <Footer />
    </div>
  )
}

