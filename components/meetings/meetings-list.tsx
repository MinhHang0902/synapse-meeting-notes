"use client"

import { useState } from "react"
import { Search, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface MeetingMinute {
  id: string
  fileName: string
  fileSize: string
  fileType: string
  project: string
  dateUploaded: string
  dateUploadedRelative: string
  lastUpdated: string
  lastUpdatedRelative: string
}

const mockMinutes: MeetingMinute[] = [
  {
    id: "1",
    fileName: "Q3_Financial_Report.pdf",
    fileSize: "2.4 MB",
    fileType: "pdf",
    project: "Digital Transformation I...",
    dateUploaded: "Sept 21, 2025",
    dateUploadedRelative: "2 hours ago",
    lastUpdated: "Sept 21, 2025",
    lastUpdatedRelative: "1 hour ago",
  },
  {
    id: "2",
    fileName: "Budget_Analysis_2025.xlsx",
    fileSize: "1.8 MB",
    fileType: "excel",
    project: "Budget Analysis 2025",
    dateUploaded: "Sept 20, 2025",
    dateUploadedRelative: "1 day ago",
    lastUpdated: "-",
    lastUpdatedRelative: "-",
  },
  {
    id: "3",
    fileName: "Project_Requirements.docx",
    fileSize: "856 KB",
    fileType: "word",
    project: "Digital Transformation I...",
    dateUploaded: "Sept 19, 2025",
    dateUploadedRelative: "2 days ago",
    lastUpdated: "-",
    lastUpdatedRelative: "-",
  },
  {
    id: "4",
    fileName: "Stakeholder_Presentation.pptx",
    fileSize: "5.2 MB",
    fileType: "powerpoint",
    project: "System Upgrade Project",
    dateUploaded: "Sept 18, 2025",
    dateUploadedRelative: "3 days ago",
    lastUpdated: "Sept 19, 2025",
    lastUpdatedRelative: "2 days ago",
  },
  {
    id: "5",
    fileName: "Security_Assessment.pdf",
    fileSize: "3.7 MB",
    fileType: "pdf",
    project: "Security Audit Review",
    dateUploaded: "Sept 17, 2025",
    dateUploadedRelative: "4 days ago",
    lastUpdated: "-",
    lastUpdatedRelative: "-",
  },
  {
    id: "6",
    fileName: "Architecture_Diagram.png",
    fileSize: "3.1 MB",
    fileType: "image",
    project: "Digital Transformation I...",
    dateUploaded: "Sept 16, 2025",
    dateUploadedRelative: "5 days ago",
    lastUpdated: "Sept 17, 2025",
    lastUpdatedRelative: "4 days ago",
  },
]

function getFileIcon(fileType: string) {
  const iconMap: Record<string, { bg: string; color: string; letter: string }> = {
    pdf: { bg: "bg-red-500", color: "text-white", letter: "D" },
    excel: { bg: "bg-green-500", color: "text-white", letter: "E" },
    word: { bg: "bg-blue-500", color: "text-white", letter: "W" },
    powerpoint: { bg: "bg-orange-500", color: "text-white", letter: "P" },
    image: { bg: "bg-purple-500", color: "text-white", letter: "I" },
  }
  return iconMap[fileType] || { bg: "bg-gray-500", color: "text-white", letter: "F" }
}

export function MeetingMinutesList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState("All Projects")

  const itemsPerPage = 6
  const totalPages = Math.ceil(mockMinutes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedMinutes = mockMinutes.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-900">My Meeting Minutes</h1>
        </div>
        <p className="text-gray-600">Files you've uploaded or have editing permissions for</p>
      </div>


      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search files</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by file name.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Projects</option>
              <option>Digital Transformation Initiative</option>
              <option>Budget Analysis 2025</option>
              <option>System Upgrade Project</option>
              <option>Security Audit Review</option>
            </select>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Search</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date Uploaded
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedMinutes.map((minute) => {
              const icon = getFileIcon(minute.fileType)
              return (
                <tr key={minute.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${icon.bg}`}>
                        <span className={`text-sm font-bold ${icon.color}`}>{icon.letter}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{minute.fileName}</p>
                        <p className="text-sm text-gray-500">{minute.fileSize}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                      {minute.project}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{minute.dateUploaded}</p>
                      <p className="text-sm text-gray-500">{minute.dateUploadedRelative}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{minute.lastUpdated}</p>
                      <p className="text-sm text-gray-500">{minute.lastUpdatedRelative}</p>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button className="p-2 hover:bg-gray-200 rounded transition-colors">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page ? "bg-gray-800 text-white" : "hover:bg-gray-200 text-gray-900"
              }`}
          >
            {page}
          </button>
        ))}
        <button className="p-2 hover:bg-gray-200 rounded transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded transition-colors">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
