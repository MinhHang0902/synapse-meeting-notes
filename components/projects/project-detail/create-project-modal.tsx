import { Button } from "@/components/ui/button";
import { Badge, Crown, Eye, FileText, Folder, FolderPlus, Mail, Plus, UserCheck, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { TeamMember } from "../project-list";

export default function CreateProjectModal({
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
                        <input
                            type="text"
                            placeholder="Enter project name..."
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full h-9 px-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors mb-1"
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
                            className="w-full p-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors mb-1 min-h-24"
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
                            
                                <span className="text-red-500">*</span>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter manager email address..."
                                        value={managerInput}
                                        onChange={(e) => setManagerInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addFromInput(managerInput, setManagers, managers)}
                                        className="w-full h-9 pl-9 pr-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                                    />
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                <Button onClick={() => addFromInput(managerInput, setManagers, managers)} variant="outline" className="px-4 bg-transparent">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>

                            {managers.length > 0 && (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div className="flex flex-wrap gap-3">
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
                        
                            </div>

                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter reviewer email address..."
                                        value={reviewerInput}
                                        onChange={(e) => setReviewerInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addFromInput(reviewerInput, setReviewers, reviewers)}
                                        className="w-full h-9 pl-9 pr-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
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
                            </div>

                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter viewer email address..."
                                        value={viewerInput}
                                        onChange={(e) => setViewerInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addFromInput(viewerInput, setViewers, viewers)}
                                        className="w-full h-9 pl-9 pr-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
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