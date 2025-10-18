"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Plus,
  Users,
  Crown,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderPlus,
  Folder,
  FileText,
  UserCheck,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  email: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Completed";
  members: number;
  files: number;
  owner: string;
  lastUpdated: string;
}

const SEED: Project[] = [
  { id: "1", name: "Marketing Campaign Q2", description: "Translation of marketing materials for Q2", status: "Active", members: 5, files: 12, owner: "John Smith", lastUpdated: "Jan 20, 2024" },
  { id: "2", name: "Company Website", description: "Multi-language website content translation", status: "Completed", members: 4, files: 25, owner: "Sarah Johnson", lastUpdated: "Jan 10, 2024" },
  { id: "3", name: "Digital Transformation Initiative", description: "Manual and technical documents translation", status: "Active", members: 3, files: 8, owner: "Anna Lee", lastUpdated: "Jan 18, 2024" },
  { id: "4", name: "Legal Contracts", description: "Translation of contracts and legal documents", status: "Completed", members: 2, files: 15, owner: "Michael Brown", lastUpdated: "Jan 15, 2024" },
];

function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject?: (data: {
    projectName: string;
    description: string;
    managers: TeamMember[];
    reviewers: TeamMember[];
    viewers: TeamMember[];
  }) => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [managers, setManagers] = useState<TeamMember[]>([{ email: "ngan@gmail.com", name: "Ngan" }]);
  const [reviewers, setReviewers] = useState<TeamMember[]>([]);
  const [viewers, setViewers] = useState<TeamMember[]>([]);
  const [managerInput, setManagerInput] = useState("");
  const [reviewerInput, setReviewerInput] = useState("");
  const [viewerInput, setViewerInput] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const addFromInput = (value: string, setList: any, list: TeamMember[]) => {
    const v = value.trim();
    if (!v) return;
    const name = v.split("@")[0] || v;
    setList([...list, { email: v, name }]);
  };


  const handleCreate = () => {
    onCreateProject?.({ projectName, description, managers, reviewers, viewers });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal role="dialog">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-start justify-between sticky top-0 z-20 rounded-t-2xl border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderPlus className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Create New Project</h2>
            </div>
            <p className="text-white/70 text-sm">
              Set up a new collaborative workspace for your team
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Project Name */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              <Folder className="w-4 h-4" />
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mb-1"
            />
            <p className="text-sm text-gray-500">Choose a descriptive name that your team will recognize</p>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              placeholder="Describe the project goals, scope, and key objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-1 min-h-24"
            />
            <p className="text-sm text-gray-500">Provide context to help team members understand the project</p>
          </div>

          {/* Team Members & Roles */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="flex items-start gap-3 mb-6">
              <div className="bg-black text-white p-2.5 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Members & Roles</h3>
                <p className="text-sm text-gray-600">Assign team members to different roles in the project</p>
              </div>
            </div>

            {/* Managers */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-gray-900" />
                <span className="font-semibold text-gray-900">Managers</span>
                <Badge className="bg-yellow-100 text-yellow-800">FULL ACCESS</Badge>
                <span className="text-red-500">*</span>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter manager email address..."
                    value={managerInput}
                    onChange={(e) => setManagerInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFromInput(managerInput, setManagers, managers)}
                    className="pl-9"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <Button onClick={() => addFromInput(managerInput, setManagers, managers)} variant="outline" className="px-4 bg-transparent">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {managers.length > 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6"> {/* p-6 thoáng hơn */}
                  <div className="flex flex-wrap gap-3"> {/* gap-3 thoáng hơn */}
                    {managers.map((m) => (
                      <div key={m.email} className="bg-white border border-gray-300 rounded-full px-3.5 py-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-[11px] font-semibold">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-600">{m.email}</p>
                        </div>
                        <button onClick={() => setManagers((s) => s.filter((x) => x.email !== m.email))} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-3">Managers have full access to edit, delete, and manage the project</p>
            </div>

            {/* Reviewers */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-4 h-4 text-gray-900" />
                <span className="font-semibold text-gray-900">Reviewers</span>
                <Badge className="bg-gray-100 text-gray-800">REVIEW & EDIT</Badge>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter reviewer email address..."
                    value={reviewerInput}
                    onChange={(e) => setReviewerInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFromInput(reviewerInput, setReviewers, reviewers)}
                    className="pl-9"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <Button onClick={() => addFromInput(reviewerInput, setReviewers, reviewers)} variant="outline" className="px-4 bg-transparent">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {reviewers.length ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {reviewers.map((r) => (
                      <div key={r.email} className="bg-white border border-gray-300 rounded-full px-3.5 py-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 bg-gray-700 text-white rounded-full flex items-center justify-center text-[11px] font-semibold">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-medium text-gray-900">{r.name}</p>
                          <p className="text-xs text-gray-600">{r.email}</p>
                        </div>
                        <button onClick={() => setReviewers((s) => s.filter((x) => x.email !== r.email))} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Add team members who can review and edit content</p>
                )}
              </div>
            </div>

            {/* Viewers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-gray-900" />
                <span className="font-semibold text-gray-900">Viewers</span>
                <Badge className="bg-gray-200 text-gray-800">READ ONLY</Badge>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter viewer email address..."
                    value={viewerInput}
                    onChange={(e) => setViewerInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFromInput(viewerInput, setViewers, viewers)}
                    className="pl-9"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <Button onClick={() => addFromInput(viewerInput, setViewers, viewers)} variant="outline" className="px-4 bg-transparent">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {viewers.length ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {viewers.map((v) => (
                      <div key={v.email} className="bg-white border border-gray-300 rounded-full px-3.5 py-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 bg-gray-500 text-white rounded-full flex items-center justify-center text-[11px] font-semibold">
                          {v.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-medium text-gray-900">{v.name}</p>
                          <p className="text-xs text-gray-600">{v.email}</p>
                        </div>
                        <button onClick={() => setViewers((s) => s.filter((x) => x.email !== v.email))} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Add stakeholders who need read-only access</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <Button onClick={onClose} variant="outline" className="px-6 bg-transparent">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-black hover:bg-black/90 px-6 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}


export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [modalOpen, setModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayed = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateProject = (data: {
    projectName: string;
    description: string;
    managers: TeamMember[];
    reviewers: TeamMember[];
    viewers: TeamMember[];
  }) => {
    const now = new Date();
    const newProject: Project = {
      id: String(Date.now()),
      name: data.projectName || "Untitled Project",
      description: data.description || "—",
      status: "Active",
      members: data.managers.length + data.reviewers.length + data.viewers.length,
      files: 0,
      owner: data.managers[0]?.name || "You",
      lastUpdated: now.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };
    setProjects((prev) => [newProject, ...prev]);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 max-w-sm"
        />
        <Button variant="outline">Filter by Status</Button>
        <Button className="bg-black text-white hover:bg-black/90">Search</Button>
      </div>

      {/* Grid 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Project Card */}
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

        {/* Project Cards */}
        {displayed.map((project) => (
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

      {/* Modal */}
      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
