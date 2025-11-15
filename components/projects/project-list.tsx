"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import {
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateProjectModal from "./project-detail/create-project-modal";

import { ProjectsApi } from "@/lib/api/project";
import type {
  ProjectListData,
  ProjectListResponse,
  CreateProjectRequest,
} from "@/types/interfaces/project";

export interface TeamMember {
  email: string;
  name: string;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Completed";
  members: number;
  files: number;
  owner: string;
  lastUpdated: string;
}

const statusToUI = (s?: string | null): "Active" | "Completed" =>
  String(s || "").toUpperCase() === "COMPLETED" ? "Completed" : "Active";

function toText(v: unknown): string {
  if (v == null) return "-";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    const anyV = v as any;
    return anyV?.name ?? anyV?.fullName ?? anyV?.email ?? anyV?.title ?? anyV?.label ?? anyV?.id ?? "-";
  }
  return "-";
}

function formatDate(d?: string | Date | null) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const HH = String(dt.getHours()).padStart(2, "0");
  const MM = String(dt.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}`;
}

function mapProject(p: ProjectListData): Project {
  return {
    id: String(p.project_id),
    name: toText(p.project_name),
    description: toText(p.project_description),
    status: statusToUI(p.project_status),
    members: p.project_members_length ?? 0,
    files: p.project_minutes_length ?? 0,
    owner: toText(p.project_owner),
    lastUpdated: formatDate(p.project_last_updated),
  };
}

export function ProjectsList() {
  const router = useRouter();
  const pathname = usePathname();
  const localeFromPath = pathname?.split("/").filter(Boolean)?.[0] || "en"; // ví dụ: /en/pages/projects

  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchProjects = async (page = currentPage, keyword?: string) => {
    setLoading(true);
    try {
      const rawSearch = typeof keyword === "string" ? keyword : searchQuery;
      const normalizedSearch = rawSearch.trim();
      const res: ProjectListResponse = await ProjectsApi.list({
        pageIndex: page,
        pageSize: itemsPerPage,
        search: normalizedSearch ? normalizedSearch : undefined,
      });
      setProjects((res.data || []).map(mapProject));
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Fetch projects failed:", err);
      setProjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearchClick = async () => {
    setCurrentPage(1);
    await fetchProjects(1, searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim() === "") {
      setCurrentPage(1);
      void fetchProjects(1, "");
    }
  };

  const handleSearchKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSearchClick();
    }
  };

  const handleOpenProject = (id: string) => {
    // Đẩy đúng path có locale: /{locale}/pages/projects/{id}
    router.push(`/${localeFromPath}/pages/projects/${id}`);
  };

  const handleCreateProject = async (data: {
    projectName: string;
    description: string;
    managers: TeamMember[];
    reviewers: TeamMember[];
    viewers: TeamMember[];
  }) => {
    try {
      const payload: CreateProjectRequest = {
        name: (data.projectName || "").trim(),
        description: (data.description || "").trim(),
        status: "ACTIVE",
        managers: data.managers?.map((m) => m.email).filter(Boolean).join(","),
        reviewers: data.reviewers?.map((m) => m.email).filter(Boolean).join(","),
        viewers: data.viewers?.map((m) => m.email).filter(Boolean).join(","),
      };
      await ProjectsApi.create(payload);
      setModalOpen(false);
      setCurrentPage(1);
      await fetchProjects(1);
    } catch (err) {
      console.error("Create project failed:", err);
    }
  };

  const displayed = projects;
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  return (
    <div className="space-y-6">
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="flex-1 max-w-sm h-9 px-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
        <Button variant="outline">Filter by Status</Button>
        <Button
          className="bg-black text-white hover:bg-black/90"
          onClick={handleSearchClick}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-64 hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => setModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setModalOpen(true)}
        >
          <Plus className="w-12 h-12 text-gray-900 mb-4" />
          <p className="text-gray-600 text-center mb-4">
            Start a new project with your team
          </p>
          <Button
            className="bg-black text-white hover:bg-black/90"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
          >
            Create Project
          </Button>
        </div>

        {displayed.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleOpenProject(project.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleOpenProject(project.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
            </div>

            <p className="text-gray-600 text-sm mb-4">{project.description}</p>

            <div className="mb-4">
              <Badge
                className={
                  project.status === "Active"
                    ? "!bg-black !text-white"
                    : "!bg-gray-400 !text-white"
                }
              >
                {project.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {project.members} Members
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {project.files} Files
              </span>
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
        <button
          onClick={() => {
            setCurrentPage(1);
            fetchProjects(1);
          }}
          disabled={safePage === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const next = Math.max(1, safePage - 1);
            setCurrentPage(next);
            fetchProjects(next);
          }}
          disabled={safePage === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => {
              setCurrentPage(page);
              fetchProjects(page);
            }}
            className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
              safePage === page ? "bg-black text-white" : "text-gray-900 hover:bg-gray-200/70"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => {
            const next = Math.min(totalPages, safePage + 1);
            setCurrentPage(next);
            fetchProjects(next);
          }}
          disabled={safePage === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setCurrentPage(totalPages);
            fetchProjects(totalPages);
          }}
          disabled={safePage === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal */}
      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
