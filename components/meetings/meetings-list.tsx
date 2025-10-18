"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface MeetingMinute {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  project: string;
  dateUploaded: string;
  dateUploadedRelative: string;
  lastUpdated: string;
  lastUpdatedRelative: string;
}

const mockMinutes: MeetingMinute[] = [
  {
    id: "1",
    fileName: "Q3_Financial_Report.pdf",
    fileSize: "2.4 MB",
    fileType: "pdf",
    project: "Digital Transformation Initiative",
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
    project: "Digital Transformation Initiative",
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
    project: "Digital Transformation Initiative",
    dateUploaded: "Sept 16, 2025",
    dateUploadedRelative: "5 days ago",
    lastUpdated: "Sept 17, 2025",
    lastUpdatedRelative: "4 days ago",
  },
];

function getFileIcon(fileType: string) {
  const iconMap: Record<string, { bg: string; color: string; letter: string }> = {
    pdf: { bg: "bg-red-500", color: "text-white", letter: "D" },
    excel: { bg: "bg-green-500", color: "text-white", letter: "E" },
    word: { bg: "bg-blue-500", color: "text-white", letter: "W" },
    powerpoint: { bg: "bg-orange-500", color: "text-white", letter: "P" },
    image: { bg: "bg-purple-500", color: "text-white", letter: "I" },
  };
  return iconMap[fileType] || { bg: "bg-gray-500", color: "text-white", letter: "F" };
}

export function MeetingMinutesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");

  const itemsPerPage = 6;

  const projects = useMemo(() => {
    const set = new Set<string>(["All Projects"]);
    mockMinutes.forEach((m) => set.add(m.project));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return mockMinutes.filter((m) => {
      const matchesProject =
        selectedProject === "All Projects" || m.project === selectedProject;
      const matchesSearch =
        !term ||
        m.fileName.toLowerCase().includes(term) ||
        m.project.toLowerCase().includes(term);
      return matchesProject && matchesSearch;
    });
  }, [searchTerm, selectedProject]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const displayedMinutes = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goFirst = () => setCurrentPage(1);
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setCurrentPage(totalPages);

  return (
    // Không padding ngang: canh thẳng với heading (card ngoài có p-6)
    <div className="space-y-6">
      {/* Search & Filter — no box/labels; same height as button; 8/3/1 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
        {/* Search (dài nhất) */}
        <div className="relative md:col-span-8">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            aria-hidden
          />
          <Input
            aria-label="Search"
            placeholder="Search by file or project…"
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="h-10 pl-10 bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:border-gray-400"
          />
        </div>

        {/* Filter (ngắn hơn) */}
        <div className="md:col-span-3">
          <select
            aria-label="Project filter"
            value={selectedProject}
            onChange={(e) => {
              setCurrentPage(1);
              setSelectedProject(e.target.value);
            }}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-400"
          >
            {projects.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Button (nhỏ nhất) */}
        <div className="md:col-span-1 flex justify-stretch md:justify-end">
          <Button className="h-10 w-full md:w-auto bg-black hover:bg-black/90 text-white">
            Apply
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                File
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Project
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Uploaded
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Last Updated
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {displayedMinutes.map((minute) => {
              const icon = getFileIcon(minute.fileType);
              return (
                <tr key={minute.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${icon.bg} flex items-center justify-center shadow-sm`}
                        aria-hidden
                      >
                        <span className={`text-sm font-bold ${icon.color}`}>{icon.letter}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{minute.fileName}</p>
                        <p className="text-xs text-gray-500">{minute.fileSize}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 py-3">
                    <span className="text-sm font-medium text-gray-900 hover:underline">
                      {minute.project}
                    </span>
                  </td>

                  <td className="px-4 md:px-6 py-3">
                    <div className="text-sm">
                      <p className="text-gray-900">{minute.dateUploaded}</p>
                      <p className="text-xs text-gray-500">{minute.dateUploadedRelative}</p>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 py-3">
                    <div className="text-sm">
                      <p className="text-gray-900">{minute.lastUpdated}</p>
                      <p className="text-xs text-gray-500">{minute.lastUpdatedRelative}</p>
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedMinutes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                  No files match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={goFirst}
          disabled={safePage === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goPrev}
          disabled={safePage === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
              safePage === page ? "bg-black text-white" : "text-gray-900 hover:bg-gray-200/70"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={goNext}
          disabled={safePage === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={goLast}
          disabled={safePage === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
