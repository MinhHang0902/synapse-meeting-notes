import { Button } from "@/components/ui/button";
import {
  Crown,
  Eye,
  FileText,
  Folder,
  FolderPlus,
  Mail,
  Plus,
  UserCheck,
  Users,
  X,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UsersApi } from "@/lib/api/user";

interface TeamMember {
  email: string;
  name: string;
}

interface SelectableUser {
  id: number;
  name: string;
  email: string;
}

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
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [reviewers, setReviewers] = useState<TeamMember[]>([]);
  const [viewers, setViewers] = useState<TeamMember[]>([]);
  const [managerInput, setManagerInput] = useState("");
  const [reviewerInput, setReviewerInput] = useState("");
  const [viewerInput, setViewerInput] = useState("");
  const [availableUsers, setAvailableUsers] = useState<SelectableUser[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProjectName("");
      setDescription("");
      setManagers([]);
      setReviewers([]);
      setViewers([]);
      setManagerInput("");
      setReviewerInput("");
      setViewerInput("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await UsersApi.getAll({
          pageIndex: 1,
          pageSize: 100,
          status: "ACTIVE",
        });
        const users: SelectableUser[] =
          res.data?.map((u) => ({
            id: u.user_id,
            name: u.name,
            email: u.email,
          })) ?? [];
        setAvailableUsers(users);
      } catch (e) {
        console.error("Failed to load users for project members:", e);
        setAvailableUsers([]);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  type RoleKey = "managers" | "reviewers" | "viewers";

  const roleLabels: Record<RoleKey, string> = {
    managers: "Manager",
    reviewers: "Reviewer",
    viewers: "Viewer",
  };

  const findRoleByEmail = (email: string): RoleKey | null => {
    const normalized = email.trim().toLowerCase();
    if (managers.some((m) => m.email.toLowerCase() === normalized)) return "managers";
    if (reviewers.some((m) => m.email.toLowerCase() === normalized)) return "reviewers";
    if (viewers.some((m) => m.email.toLowerCase() === normalized)) return "viewers";
    return null;
  };

  const ensureUniqueRole = (email: string, targetRole: RoleKey) => {
    const existingRole = findRoleByEmail(email);
    if (!existingRole) {
      setErrorMessage(null);
      return true;
    }
    if (existingRole === targetRole) {
      setErrorMessage(`${email} has already been added with the role ${roleLabels[targetRole]}.`);
      return false;
    }
    setErrorMessage(
      `Email ${email} is currently assigned the role ${roleLabels[existingRole]}. Each member can only have one role.`
    );
    return false;
  };

  const addFromInput = (
    value: string,
    role: RoleKey,
    setList: (value: TeamMember[]) => void,
    list: TeamMember[],
    clearInput: () => void
  ) => {
    const v = value.trim();
    if (!v) return;
    if (!ensureUniqueRole(v, role)) return;
    const name = v.split("@")[0] || v;
    setList([...list, { email: v, name }]);
    clearInput();
    setErrorMessage(null);
  };

  const addFromUser = (
    user: SelectableUser,
    role: RoleKey,
    setList: (value: TeamMember[]) => void,
    list: TeamMember[]
  ) => {
    if (!ensureUniqueRole(user.email, role)) return;
    setList([...list, { email: user.email, name: user.name }]);
    setErrorMessage(null);
  };

  const isValid = projectName.trim().length > 0 && managers.length > 0;
  const canSubmit = isValid && !errorMessage;

  const handleCreate = () => {
    if (!canSubmit) return;
    onCreateProject?.({ projectName, description, managers, reviewers, viewers });
    onClose();
  };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal role="dialog">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

                <div className="p-6 space-y-8">
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

                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        {errorMessage && (
                          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errorMessage}
                          </div>
                        )}

                        <div className="flex items-start gap-3 mb-6">
                            <div className="bg-black text-white p-2.5 rounded-lg">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Team Members & Roles</h3>
                                <p className="text-sm text-gray-600">Assign team members to different roles in the project</p>
                            </div>
                        </div>

    
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
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                addFromInput(managerInput, "managers", setManagers, managers, () => setManagerInput(""));
                                            }
                                        }}
                                        className="w-full h-9 pl-9 pr-9 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                                    />
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 max-h-72 overflow-auto">
                                            {availableUsers.length === 0 && (
                                                <DropdownMenuItem disabled>No users</DropdownMenuItem>
                                            )}
                                            {availableUsers.map((u) => (
                                                <DropdownMenuItem
                                                    key={u.id}
                                                    onClick={() => addFromUser(u, "managers", setManagers, managers)}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900">{u.name}</span>
                                                        <span className="text-xs text-gray-500">{u.email}</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Button onClick={() => addFromInput(managerInput, "managers", setManagers, managers, () => setManagerInput(""))} variant="outline" className="px-4 bg-transparent">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                {managers.length > 0 ? (
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
                                ) : (
                                    <p className="text-gray-500 text-sm text-center">Add team members who have full access to manage the project</p>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mt-3">Managers have full access to edit, delete, and manage the project</p>
                        </div>

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
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                addFromInput(reviewerInput, "reviewers", setReviewers, reviewers, () => setReviewerInput(""));
                                            }
                                        }}
                                        className="w-full h-9 pl-9 pr-9 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                                    />
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 max-h-72 overflow-auto">
                                            {availableUsers.length === 0 && (
                                                <DropdownMenuItem disabled>No users</DropdownMenuItem>
                                            )}
                                            {availableUsers.map((u) => (
                                                <DropdownMenuItem
                                                    key={u.id}
                                                    onClick={() => addFromUser(u, "reviewers", setReviewers, reviewers)}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900">{u.name}</span>
                                                        <span className="text-xs text-gray-500">{u.email}</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Button onClick={() => addFromInput(reviewerInput, "reviewers", setReviewers, reviewers, () => setReviewerInput(""))} variant="outline" className="px-4 bg-transparent">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                {reviewers.length ? (
                                    <div className="flex flex-wrap gap-3">
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
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                addFromInput(viewerInput, "viewers", setViewers, viewers, () => setViewerInput(""));
                                            }
                                        }}
                                        className="w-full h-9 pl-9 pr-9 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                                    />
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 max-h-72 overflow-auto">
                                            {availableUsers.length === 0 && (
                                                <DropdownMenuItem disabled>No users</DropdownMenuItem>
                                            )}
                                            {availableUsers.map((u) => (
                                                <DropdownMenuItem
                                                    key={u.id}
                                                    onClick={() => addFromUser(u, "viewers", setViewers, viewers)}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900">{u.name}</span>
                                                        <span className="text-xs text-gray-500">{u.email}</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Button onClick={() => addFromInput(viewerInput, "viewers", setViewers, viewers, () => setViewerInput(""))} variant="outline" className="px-4 bg-transparent">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                {viewers.length ? (
                                    <div className="flex flex-wrap gap-3">
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

                <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
                    <Button onClick={onClose} variant="outline" className="px-6 bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!canSubmit}
                        className={`px-6 text-white ${
                          canSubmit
                            ? "bg-black hover:bg-black/90"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                    </Button>
                </div>
            </div>
        </div>
    );
}