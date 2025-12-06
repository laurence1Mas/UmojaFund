"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Carousel } from "@/components/carousel"
import { Heart, TrendingUp, Users, ArrowRight } from "lucide-react"

export default function Home() {
  const carouselSlides = [
    {
      image: "/slide-1.png",
      title: "Empower Communities, Fund Innovation",
      description:
        "Join thousands of people supporting innovative projects and creating positive change in their communities.",
      buttonText: "Explore Projects",
      buttonLink: "/projects",
    },
    {
      image: "/slide-2.png",
      title: "Support Bold Ideas",
      description:
        "Be part of the movement that turns great ideas into reality through community-powered funding.",
      buttonText: "Start a Project",
      buttonLink: "/auth/register",
    },
    {
      image: "/slide-3.jpg",
      title: "Create Global Impact",
      description:
        "Your contribution has the power to create lasting change across the globe.",
      buttonText: "Browse Projects",
      buttonLink: "/projects",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in the power of communities coming together to create positive change.",
    },
    {
      icon: TrendingUp,
      title: "Sustainable Growth",
      description: "Supporting projects that create lasting impact and sustainable development.",
    },
    {
      icon: Users,
      title: "Transparency",
      description: "Complete transparency in all transactions and project updates.",
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
      title: "Create a Project",
      description: "Share your idea and set your funding goal.",
    },
    {
      number: "2",
      title: "Share Your Vision",
      description: "Tell the world why your project matters.",
    },
    {
      number: "3",
      title: "Get Support",
      description: "Receive funding from our community.",
    },
    {
      number: "4",
      title: "Make an Impact",
      description: "Bring your project to life and create change.",
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to UmojaFund</h2>
              <p className="text-gray-600 mb-4">
                UmojaFund is a community-driven crowdfunding platform dedicated to empowering individuals and organizations
                to bring their innovative projects to life. We believe in the power of collective action to create positive
                change in communities around the world.
              </p>
              <p className="text-gray-600">
                Whether you're looking to launch a new initiative, support a cause, or connect with like-minded individuals,
                UmojaFund provides the tools and resources you need to succeed.
              </p>
            </div>
            <div>
              <img
                src="/about-hero.png"
                alt="About UmojaFund"
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>  
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Recent Projects</h2>
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
                    Learn More <ArrowRight size={16} />
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
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

      <Footer />
    </div>
  )
}
