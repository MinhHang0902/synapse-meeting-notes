"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, NotebookText, Users2, Edit2, Trash2 } from "lucide-react";
import ProjectOverview from "./project-overview";
import ProjectMinutes from "./project-minutes";
import ProjectMembers from "./project-members";
import EditProjectModal from "./edit-project-modal";
import { ProjectsApi } from "@/lib/api/project";
import type { ProjectDetailResponse, MemberProjectData } from "@/types/interfaces/project";
import ConfirmDeleteDialog from "@/components/confirm-dialog";

type TabKey = "overview" | "minutes" | "members";

const toUIStatus = (s?: string | null) =>
  String(s || "").toUpperCase() === "COMPLETED" ? "Completed" : "Active";
const toAPIStatus = (s: "Active" | "Completed") => (s === "Completed" ? "COMPLETED" : "ACTIVE");

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
  return `${dd} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dt.getMonth()]} ${yyyy}`;
}

function membersByRole(
  members: MemberProjectData[] | undefined,
  role: "MANAGER" | "REVIEWER" | "VIEWER"
) {
  return (members || [])
    .filter((m) => String(m.projectRole?.role_type || "").toUpperCase() === role)
    .map((m) => toText(m.user));
}

export function ProjectDetail({ id, locale }: { id: string; locale: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [openEdit, setOpenEdit] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "minutes", label: "Minutes", icon: NotebookText },
    { key: "members", label: "Members", icon: Users2 },
  ] as const;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const recalc = () => {
    const el = itemRefs.current[activeTab];
    const wrap = containerRef.current;
    if (!el || !wrap) return;
    const { left: l1 } = wrap.getBoundingClientRect();
    const { left: l2, width } = el.getBoundingClientRect();
    setIndicator({ left: l2 - l1, width });
  };
  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [activeTab]);

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(null);

  const project = detail
    ? {
        name: toText(detail.project_name),
        description: toText((detail as any).project_description),
        createdDate: formatDate(detail.project_createdAt),
        status: toUIStatus(detail.project_status) as "Active" | "Completed",
        managers: membersByRole(detail.project_membersAndRoles, "MANAGER"),
        reviewers: membersByRole(detail.project_membersAndRoles, "REVIEWER"),
        viewers: membersByRole(detail.project_membersAndRoles, "VIEWER"),
      }
    : {
        name: "",
        description: "",
        createdDate: "",
        status: "Active" as const,
        managers: [] as string[],
        reviewers: [] as string[],
        viewers: [] as string[],
      };

  const meetingMinutes =
    (detail?.project_minutes as any[])?.map((it, idx) => ({
      // minute_id là khóa chính thực tế của meeting minute,
      // dùng để điều hướng sang trang detail /meeting-minutes/{minute_id}
      id: it?.minute_id ?? it?.id ?? idx + 1,
      fileName: toText(it?.file_name || it?.title || "Untitled"),
      uploader: toText(it?.uploader_name),
      uploadDate: formatDate(it?.uploaded_at),
      fileType: (String(it?.file_type || "").toLowerCase() ||
        (it?.file_name?.split(".").pop()?.toLowerCase() ?? "file")) as
        | "pdf"
        | "excel"
        | "word"
        | "powerpoint"
        | "image",
    })) ?? [];

  const recentActivity =
    (detail?.project_RecentActivities as any[])?.map((a, i) => ({
      id: a?.id ?? i + 1,
      type: toText(a?.type || "file"),
      user: toText(a?.user || a?.actor || ""),
      action: toText(a?.action || "updated"),
      item: toText(a?.item || a?.subject || ""),
      time: toText(a?.time || "just now"),
    })) ?? [];

  const teamMembers =
    (detail?.project_membersAndRoles || []).map((m, i) => {
      const name = toText(m.user);
      const emailRaw = (m as any)?.user?.email ?? "";
      const email = typeof emailRaw === "string" ? emailRaw : toText(emailRaw);
      const displayForInitials = name || email || "Member";
      const initials =
        displayForInitials
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((s) => s[0])
          .join("")
          .toUpperCase() || "MB";
      const palette = ["bg-blue-500", "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-emerald-500", "bg-indigo-500"];
      const color = palette[(email + name).length % palette.length];
      const roleType = String(m.projectRole?.role_type || "").toUpperCase();
      const role = roleType === "MANAGER" ? "Manager" : roleType === "REVIEWER" ? "Reviewer" : "Viewer";
      return {
        id: (m as any)?.user?.user_id ?? i + 1,
        name,
        email,
        role,
        avatar: initials,
        avatarColor: color,
      };
    }) ?? [];

  const load = async () => {
    try {
      setLoading(true);
      const res = await ProjectsApi.detail(Number(id));
      setDetail(res);
    } catch (e) {
      console.error("Load project detail failed:", e);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [id]);

  const requestDelete = () => {
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await ProjectsApi.remove(Number(id));
      console.log("Deleted project", id);
      router.push(`/${locale}/pages/projects`);
    } catch (e) {
      console.error("Delete project failed:", e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-black text-white hover:bg-black/90 gap-2" onClick={() => setOpenEdit(true)}>
            <Edit2 size={16} />
            Edit Project
          </Button>
          <Button className="bg-black text-white hover:bg-black/90 gap-2" onClick={requestDelete}>
            <Trash2 size={16} />
            Delete Project
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div ref={containerRef} className="relative flex gap-8">
          <span
            className="pointer-events-none absolute -bottom-px h-[2px] bg-black rounded-full"
            style={{
              width: indicator.width,
              transform: `translateX(${indicator.left}px)`,
              transition: "transform 260ms cubic-bezier(.22,.61,.36,1), width 260ms cubic-bezier(.22,.61,.36,1)",
            }}
          />
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                ref={(el) => {
                  itemRefs.current[key] = el;
                }}
                onClick={() => setActiveTab(key as TabKey)}
                className={[
                  "relative pb-3 px-1 inline-flex items-center gap-1.5 text-sm transition-colors",
                  active ? "text-black" : "text-gray-500 hover:text-gray-800",
                ].join(" ")}
              >
                <Icon size={14} className={active ? "text-black" : "text-gray-500"} />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!loading && activeTab === "overview" && <ProjectOverview project={project} recentActivity={recentActivity} />}
      {!loading && activeTab === "minutes" && <ProjectMinutes meetingMinutes={meetingMinutes} />}
      {!loading && activeTab === "members" && <ProjectMembers teamMembers={teamMembers} />}

      <EditProjectModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        defaultValues={{
          name: project.name,
          description: project.description, 
        }}
        onSubmit={async (data) => {
          try {
            await ProjectsApi.update(Number(id), {
              name: data.name,
              description: data.description,
              status: toAPIStatus(project.status),
            });
            await load(); 
          } catch (e) {
            console.error("Update project failed:", e);
          }
        }}
      />
      
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Warning"
        description={
          project.name
            ? `Do you really want to delete this project "${project.name}"? This action cannot be undone.`
            : "Do you really want to delete this project? This action cannot be undone."
        }
        cancelText="Cancel"
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}

export default ProjectDetail;
