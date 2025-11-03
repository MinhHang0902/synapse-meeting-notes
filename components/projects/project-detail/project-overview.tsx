"use client";

import { Info, Clock, FileText, ClipboardList, User, PencilRuler } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { ProjectsApi } from "@/lib/api/project";
import { useParams } from "next/navigation";

type Props = {
  project: {
    name: string;
    description: string;
    // fullDescription: string;
    createdDate: string;
    status: "Active" | "Completed";
    managers: string[];
    reviewers: string[];
    viewers: string[];
  };
  recentActivity: {
    id: number;
    type: string;
    user?: string;
    action: string;
    item?: string;
    time: string;
  }[];
};

const toAPIStatus = (s: "Active" | "Completed") => (s === "Completed" ? "COMPLETED" : "ACTIVE");

export default function ProjectOverview({ project, recentActivity }: Props) {
  const [currentStatus, setCurrentStatus] = useState<"Active" | "Completed">(project.status);
  const statusOptions: ("Active" | "Completed")[] = ["Active", "Completed"];
  const { id } = useParams();

  // khi đổi status -> call API update (optimistic)
  useEffect(() => {
    if (currentStatus === project.status) return;
    (async () => {
      try {
        await ProjectsApi.update(Number(id), {
          name: project.name,
          description: project.description,
          status: toAPIStatus(currentStatus),
        });
      } catch (e) {
        console.error("Update status failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="w-4 h-4 text-gray-700" />;
      case "mom":
        return <ClipboardList className="w-4 h-4 text-gray-700" />;
      case "member":
        return <User className="w-4 h-4 text-gray-700" />;
      case "action":
        return <PencilRuler className="w-4 h-4 text-gray-700" />;
      default:
        return <Clock className="w-4 h-4 text-gray-700" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Project Information */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-gray-700">
            <Info className="w-4 h-4" />
          </div>
          Project Information
        </h2>

        <dl className="divide-y divide-gray-100">
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">Project Name</dt>
            <dd className="col-span-7 md:col-span-8 text-sm text-gray-900 flex justify-end text-right">
              {project.name}
            </dd>
          </div>

          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">Description</dt>
            <dd className="col-span-7 md:col-span-8 text-sm text-gray-900 flex justify-end text-right">
              {project.description}
            </dd>
          </div>

          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">Created Date</dt>
            <dd className="col-span-7 md:col-span-8 text-sm text-gray-900 flex justify-end">{project.createdDate}</dd>
          </div>

          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">Status</dt>
            <dd className="col-span-7 md:col-span-8 flex justify-end">
              <Select value={currentStatus} onValueChange={(v: "Active" | "Completed") => setCurrentStatus(v)}>
                <SelectTrigger className="h-9 w-auto min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        currentStatus === "Active" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <SelectValue>{currentStatus}</SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent align="end" className="min-w-0 w-[var(--radix-select-trigger-width)] max-w-none">
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            status === "Active" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </dd>
          </div>

          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">Manager(s)</dt>
            <dd className="col-span-7 md:col-span-8 flex flex-wrap justify-end gap-2">
              {project.managers.map((m) => (
                <span key={m} className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium">
                  {m}
                </span>
              ))}
            </dd>
          </div>

          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">Reviewer(s)</dt>
            <dd className="col-span-7 md:col-span-8 flex flex-wrap justify-end gap-2">
              {project.reviewers.map((r) => (
                <span key={r} className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium">
                  {r}
                </span>
              ))}
            </dd>
          </div>

          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">Viewer(s)</dt>
            <dd className="col-span-7 md:col-span-8 flex flex-wrap justify-end gap-2">
              {project.viewers.map((v) => (
                <span key={v} className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium">
                  {v}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-gray-700">
            <Clock className="w-4 h-4" />
          </div>
          Recent Activity
        </h2>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="pb-4 border-b border-gray-100 last:border-b-0">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    {activity.user && <span className="font-medium">{activity.user}</span>}
                    {activity.user && activity.action && " "}
                    {activity.action}
                    {activity.item && <span className="font-medium"> "{activity.item}"</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
