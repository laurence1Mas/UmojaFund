"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { useMemo, useState } from "react"

export default function Projects() {
  const [query, setQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const projects = [
    {
      id: 1,
      title: "Clean Water Initiative",
      category: "Environment",
      progress: 75,
      raised: 15000,
      goal: 20000,
      image: "/clean-water-project.jpg",
      creator: "Emma Green",
    },
    {
      id: 2,
      title: "Tech Education Program",
      category: "Education",
      progress: 45,
      raised: 9000,
      goal: 20000,
      image: "/tech-education.jpg",
      creator: "John Tech",
    },
    {
      id: 3,
      title: "Community Garden",
      category: "Agriculture",
      progress: 90,
      raised: 18000,
      goal: 20000,
      image: "/community-garden.jpg",
      creator: "Maria Farms",
    },
    {
      id: 4,
      title: "Healthcare Access",
      category: "Health",
      progress: 60,
      raised: 12000,
      goal: 20000,
      image: "/healthcare-project.jpg",
      creator: "Dr. Sarah",
    },
    {
      id: 5,
      title: "Arts & Culture Hub",
      category: "Culture",
      progress: 35,
      raised: 7000,
      goal: 20000,
      image: "/arts-culture.jpg",
      creator: "Alex Artist",
    },
    {
      id: 6,
      title: "Youth Sports Program",
      category: "Sports",
      progress: 80,
      raised: 16000,
      goal: 20000,
      image: "/youth-sports.jpg",
      creator: "Coach Mike",
    },
  ]

  // Derived data
  const categories = useMemo(() => {
    const map: Record<string, number> = {}
    projects.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1
    })
    return map
  }, [projects])

  const recentProjects = projects.slice(0, 3)

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery = query.trim() === "" || p.title.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category)
      return matchesQuery && matchesCategory
    })
  }, [projects, query, selectedCategories])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        <section className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Projects</h1>
            <p className="text-xl text-blue-100">Discover innovative projects making a real difference in the world</p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main content (projects) */}
              <div className="lg:col-span-3">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      type="text"
                      placeholder="Search projects..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm transform transition duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]"
                    >
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold flex-1">{project.title}</h3>
                          <span className="text-xs bg-secondary/10 text-primary px-3 py-1 rounded-full whitespace-nowrap ml-2">
                            {project.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">by {project.creator}</p>
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
                          View Details <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination (simple) */}
                <div className="mt-10 flex items-center justify-center">
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700 rounded-l-md">
                      Préc
                    </a>
                    <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700">
                      1
                    </a>
                    <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700">
                      2
                    </a>
                    <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700 rounded-r-md">
                      Suiv
                    </a>
                  </nav>
                </div>
              </div>

              {/* Aside */}
              <aside className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-3">Filters</h4>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="space-y-2">
                        {Object.keys(categories).map((cat) => (
                          <label key={cat} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={() => {
                                setSelectedCategories((prev) =>
                                  prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                                )
                              }}
                              className="h-4 w-4 text-primary border-gray-300 rounded"
                            />
                            <span className="capitalize">{cat} <span className="text-muted text-xs">({categories[cat]})</span></span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
                      <select className="w-full border rounded px-3 py-2 text-sm">
                        <option value="">All</option>
                        <option value="0-25">0% - 25%</option>
                        <option value="25-50">25% - 50%</option>
                        <option value="50-75">50% - 75%</option>
                        <option value="75-100">75% - 100%</option>
                      </select>
                    </div>
                  </div>

                  {/* Recent Projects */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-3">Recent Projects</h4>
                    <div className="space-y-3">
                      {recentProjects.map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-3">
                          <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <div className="text-sm font-medium">{p.title}</div>
                            <div className="text-xs text-muted">{p.category}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Stats by category */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-3">Projects by Category</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {Object.entries(categories).map(([cat, count]) => (
                        <li key={cat} className="flex items-center justify-between">
                          <span className="capitalize">{cat}</span>
                          <span className="text-muted">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
