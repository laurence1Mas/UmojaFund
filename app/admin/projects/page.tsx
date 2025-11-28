"use client"

import { Search, MoreVertical } from "lucide-react"

export default function AdminProjects() {
  const projects = [
    { id: 1, title: "Clean Water Initiative", status: "Active", raised: "15,000 Ada", goal: "20,000 Ada" },
    { id: 2, title: "Tech Education Program", status: "Active", raised: "9,000 Ada", goal: "20,000 Ada" },
    { id: 3, title: "Community Garden", status: "Completed", raised: "20,000 Ada", goal: "20,000 Ada" },
    { id: 4, title: "Healthcare Access", status: "Active", raised: "12,000 Ada", goal: "20,000 Ada" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <p className="text-gray-600">Manage platform projects</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left font-bold">Title</th>
              <th className="px-6 py-4 text-left font-bold">Status</th>
              <th className="px-6 py-4 text-left font-bold">Raised</th>
              <th className="px-6 py-4 text-left font-bold">Goal</th>
              <th className="px-6 py-4 text-left font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{project.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "Active" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{project.raised}</td>
                <td className="px-6 py-4 text-gray-600">{project.goal}</td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
