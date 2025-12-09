"use client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle } from "lucide-react"

export default function About() {
  const stats = [
    { label: "Projects Funded", value: "500+" },
    { label: "Community Members", value: "50K+" },
    { label: "Total Raised", value: "5M+ Ada" },
    { label: "Success Rate", value: "85%" },
  ]

  const team = [
    { name: "Marcelin Mulezi", role: "CEO & Co-Founder" },
    { name: "Pablo", role: "CTO & Co-Founder" },
    { name: "Jean-Claude", role: "Head of Community" },
    { name: "Christophe", role: "CFO" },
    { name: "Robert", role: "Software developper" },
    { name: "Laurence", role: "Full-stack developper" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About UmojaFund</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Connecting visionaries with supporters to create lasting positive change
            </p>
          </div>
        </section>
        {/*  About-section */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What is UmojaFund ?</h2>
                <p className="text-gray-600 mb-4">
                  UmojaFund is a community-driven crowdfunding platform dedicated to empowering individuals and organizations
                  to bring their innovative projects to life. We believe in the power of collective action to create positive
                  change in communities around the world.
                </p>
                <p className="text-gray-600">
                  Whether you're looking to launch a new initiative, support a cause, or connect with like-minded individuals,
                  UmojaFund provides the tools and resources you need to succeed.
                </p>
                
                {/* Part who present differents objectives of UmojaFund using icones "chek "<i class=""></i> */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-3xl md:text-4xl mb-4">Our Objectves</h3>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-1" />
                    <p className="text-gray-600">
                      Empowering communities worldwide through accessible crowdfunding solutions.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-1" />
                    <p className="text-gray-600">
                      Fostering innovation by connecting creators with passionate supporters.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-1" />
                    <p className="text-gray-600">
                      Building a global network of changemakers dedicated to making a positive impact.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <a
                    href="/projects"
                    className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Explore Projects
                  </a>
                </div>
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
        {/* Mission & Vision */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                  To empower communities worldwide by democratizing access to capital for innovative projects and social
                  initiatives. We believe that great ideas deserve to be funded, and that communities are strongest when
                  working together.
                </p>
                <p className="text-gray-600">
                  UmojaFund provides the platform, tools, and community support needed to turn visions into reality.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-gray-600 mb-4">
                  A world where anyone with a great idea can access funding and support to make it happen. Where
                  communities collaborate to solve problems and create positive change.
                </p>
                <p className="text-gray-600">
                  We envision a global network of creators, innovators, and supporters building a better future
                  together.
                </p>
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
            <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Environmental Projects</h3>
                <p className="text-gray-600">
                  Supporting initiatives for sustainable development and climate action across the globe.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Education & Skills</h3>
                <p className="text-gray-600">
                  Funding programs that provide access to quality education and training opportunities.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Community Development</h3>
                <p className="text-gray-600">
                  Empowering local communities with resources to build and improve their neighborhoods.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4"></div>
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
