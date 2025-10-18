"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    LayoutGrid,
    NotebookText,
    Users2,
    Edit2,
    Trash2,
} from "lucide-react";

import ProjectOverview from "./project-overview";
import ProjectMinutes from "./project-minutes";
import ProjectMembers from "./project-members";

type TabKey = "overview" | "minutes" | "members";

export function ProjectDetail() {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    /** ---------------- Tabs config ---------------- */
    const tabs = [
        { key: "overview", label: "Overview", icon: LayoutGrid },
        { key: "minutes", label: "Minutes", icon: NotebookText },
        { key: "members", label: "Members", icon: Users2 },
    ] as const;

    /** ---------------- Animated underline ---------------- */
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    /** ---------------- Demo data (thay bằng data thật của bạn) ---------------- */
    const project = {
        name: "Digital Transformation Initiative",
        description:
            "Comprehensive digital modernization project for enterprise systems",
        fullDescription:
            "Modernizing legacy systems and implementing cloud-native solutions",
        createdDate: "September 15, 2025",
        status: "Active",
        managers: ["Sarah Johnson", "Mike Chen"],
        reviewers: ["David Kim", "Lisa Wong", "Alex Rodriguez"],
        viewers: ["John Smith", "Emma Davis", "+5 more"],
    };

    const recentActivity = [
        {
            id: 1,
            type: "file",
            user: "Sarah Johnson",
            action: "uploaded",
            item: "Q3_Financial_Report.pdf",
            time: "2 hours ago",
        },
        {
            id: 2,
            type: "mom",
            action: "exported for",
            item: "Weekly Team Meeting - Sept 20",
            time: "5 hours ago",
        },
        {
            id: 3,
            type: "member",
            user: "Alex Rodriguez",
            action: "added as Reviewer",
            time: "1 day ago",
        },
        {
            id: 4,
            type: "action",
            action: "3 new action items created from",
            item: "Strategy Review Meeting",
            time: "2 days ago",
        },
    ];

    const meetingMinutes = [
        {
            id: 1,
            fileName: "Q3_Financial_Report.pdf",
            uploader: "Sarah Johnson",
            uploadDate: "Sept 21, 2025",
            fileType: "pdf",
        },
        {
            id: 2,
            fileName: "Budget_Analysis_2025.xlsx",
            uploader: "Mike Chen",
            uploadDate: "Sept 20, 2025",
            fileType: "excel",
        },
        {
            id: 3,
            fileName: "Project_Requirements.docx",
            uploader: "David Kim",
            uploadDate: "Sept 19, 2025",
            fileType: "word",
        },
        {
            id: 4,
            fileName: "Stakeholder_Presentation.pptx",
            uploader: "Lisa Wong",
            uploadDate: "Sept 18, 2025",
            fileType: "powerpoint",
        },
        {
            id: 5,
            fileName: "Architecture_Diagram.png",
            uploader: "Alex Rodriguez",
            uploadDate: "Sept 17, 2025",
            fileType: "image",
        },
    ];

    const teamMembers = [
        {
            id: 1,
            name: "Sarah Johnson",
            email: "sarah.johnson@company.com",
            role: "Manager",
            avatar: "SJ",
            avatarColor: "bg-blue-500",
        },
        {
            id: 2,
            name: "Mike Chen",
            email: "mike.chen@company.com",
            role: "Manager",
            avatar: "MC",
            avatarColor: "bg-pink-500",
        },
        {
            id: 3,
            name: "David Kim",
            email: "david.kim@company.com",
            role: "Reviewer",
            avatar: "DK",
            avatarColor: "bg-cyan-500",
        },
        {
            id: 4,
            name: "Lisa Wong",
            email: "lisa.wong@company.com",
            role: "Reviewer",
            avatar: "LW",
            avatarColor: "bg-orange-500",
        },
        {
            id: 5,
            name: "Alex Rodriguez",
            email: "alex.rodriguez@company.com",
            role: "Reviewer",
            avatar: "AR",
            avatarColor: "bg-cyan-300",
        },
        {
            id: 6,
            name: "John Smith",
            email: "john.smith@company.com",
            role: "Viewer",
            avatar: "JS",
            avatarColor: "bg-orange-300",
        },
        {
            id: 7,
            name: "Emma Davis",
            email: "emma.davis@company.com",
            role: "Viewer",
            avatar: "ED",
            avatarColor: "bg-pink-400",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        {project.name}
                    </h1>
                    <p className="text-gray-600">{project.description}</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-black text-white hover:bg-black/90 gap-2">
                        <Edit2 size={16} />
                        Edit Project
                    </Button>
                    <Button className="bg-black text-white hover:bg-black/90 gap-2">
                        <Trash2 size={16} />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Tabs - style v0 (đen, icon nhỏ, underline mượt) */}
            <div className="border-b border-gray-200">
                <div ref={containerRef} className="relative flex gap-8">
                    {/* underline chạy mượt */}
                    <span
                        className="pointer-events-none absolute -bottom-px h-[2px] bg-black rounded-full"
                        style={{
                            width: indicator.width,
                            transform: `translateX(${indicator.left}px)`,
                            transition:
                                "transform 260ms cubic-bezier(.22,.61,.36,1), width 260ms cubic-bezier(.22,.61,.36,1)",
                        }}
                    />
                    {tabs.map(({ key, label, icon: Icon }) => {
                        const active = activeTab === key;
                        return (
                            <button
                                key={key}
                                ref={(el) => {
                                    itemRefs.current[key] = el
                                }}
                                onClick={() => setActiveTab(key as TabKey)}
                                className={[
                                    "relative pb-3 px-1 inline-flex items-center gap-1.5",
                                    "text-sm",
                                    active ? "text-black" : "text-gray-500 hover:text-gray-800",
                                    "transition-colors",
                                ].join(" ")}
                                aria-current={active ? "page" : undefined}
                            >
                                <Icon size={14} className={active ? "text-black" : "text-gray-500"} />
                                <span className="font-medium">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            {activeTab === "overview" && (
                <ProjectOverview project={project} recentActivity={recentActivity} />
            )}
            {activeTab === "minutes" && (
                <ProjectMinutes meetingMinutes={meetingMinutes} />
            )}
            {activeTab === "members" && (
                <ProjectMembers teamMembers={teamMembers} />
            )}
        </div>
    );
}

export default ProjectDetail;
