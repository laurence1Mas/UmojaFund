"use client"

import { ArrowRight } from "lucide-react"

export default function MyProjects() {
  const projects = [
    {
      id: 1,
      title: "Clean Water Initiative",
      category: "Environment",
      invested: "500 Ada",
      status: "Active",
      image: "/clean-water.jpg",
    },
    {
      id: 2,
      title: "Tech Education Program",
      category: "Education",
      invested: "300 Ada",
      status: "Active",
      image: "/tech-education.jpg",
    },
    {
      id: 3,
      title: "Community Garden",
      category: "Agriculture",
      invested: "200 Ada",
      status: "Active",
      image: "/community-garden.jpg",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <p className="text-gray-600">Projects you're currently funding or following</p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow"
          >
            <img
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{project.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{project.category}</p>
              <p className="text-primary font-bold">Invested: {project.invested}</p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 whitespace-nowrap">
              View Details <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
