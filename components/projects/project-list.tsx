"use client"

import { useState } from "react"
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "../ui/badge"

interface Project {
  id: string
  name: string
  description: string
  status: "Active" | "Completed"
  members: number
  files: number
  owner: string
  lastUpdated: string
}

const projects: Project[] = [
  { id: "1", name: "Marketing Campaign Q2", description: "Translation of marketing materials for Q2", status: "Active", members: 5, files: 12, owner: "John Smith", lastUpdated: "Jan 20, 2024" },
  { id: "2", name: "Company Website", description: "Multi-language website content translation", status: "Completed", members: 4, files: 25, owner: "Sarah Johnson", lastUpdated: "Jan 10, 2024" },
  { id: "3", name: "Digital Transformation Initiative", description: "Manual and technical documents translation", status: "Active", members: 3, files: 8, owner: "Anna Lee", lastUpdated: "Jan 18, 2024" },
  { id: "4", name: "Legal Contracts", description: "Translation of contracts and legal documents", status: "Completed", members: 2, files: 15, owner: "Michael Brown", lastUpdated: "Jan 15, 2024" },
]

export function ProjectsList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 1 Create card + 5 project cards = 6 tiles / page (3x2)
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="flex-1 max-w-sm"
        />
        <Button variant="outline">Filter by Status</Button>
        <Button className="bg-black text-white hover:bg-black/90">Search</Button>
      </div>

      {/* Grid 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-64 hover:border-gray-400 transition-colors cursor-pointer">
          <Plus className="w-12 h-12 text-gray-900 mb-4" />
          <p className="text-gray-600 text-center mb-4">Start a new project with your team</p>
          <Button className="bg-black text-white hover:bg-black/90">Create Project</Button>
        </div>

        {/* Project Cards */}
        {displayedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
            </div>

            <p className="text-gray-600 text-sm mb-4">{project.description}</p>

            <div className="mb-4">
              <Badge
                className={
                  project.status === "Active"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                }
              >
                {project.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>👥 {project.members} Members</span>
              <span>📄 {project.files} Files</span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-1">Owner: {project.owner}</p>
              <p className="text-sm text-gray-500">Last updated: {project.lastUpdated}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className={currentPage === page ? "bg-black text-white hover:bg-black/90" : ""}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
