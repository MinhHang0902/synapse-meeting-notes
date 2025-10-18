"use client";

import {
  Info,
  Clock,
  FileText,
  ClipboardList,
  User,
  PencilRuler,
} from "lucide-react";

type Props = {
  project: {
    name: string;
    description: string;
    fullDescription: string;
    createdDate: string;
    status: string;
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

export default function ProjectOverview({ project, recentActivity }: Props) {
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
          {/* Project Name */}
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">
              Project Name
            </dt>
            <dd className="col-span-7 md:col-span-8 text-sm text-gray-900 flex justify-end text-right">
              {project.name}
            </dd>
          </div>

          {/* Description */}
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">
              Description
            </dt>
            <dd className="col-span-7 md:col-span-8 text-sm text-gray-900 flex justify-end text-right">
              {project.fullDescription}
            </dd>
          </div>

          {/* Created Date */}
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">
              Created Date
            </dt>
            <dd className="col-span-7 md:col-span-8 text-sm text-gray-900 flex justify-end">
              {project.createdDate}
            </dd>
          </div>

          {/* Status */}
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">
              Status
            </dt>
            <dd className="col-span-7 md:col-span-8 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                {project.status}
                <svg
                  className="h-4 w-4 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
                </svg>
              </button>
            </dd>
          </div>

          {/* Managers */}
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">
              Manager(s)
            </dt>
            <dd className="col-span-7 md:col-span-8 flex flex-wrap justify-end gap-2">
              {project.managers.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium"
                >
                  {m}
                </span>
              ))}
            </dd>
          </div>

          {/* Reviewers */}
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">
              Reviewer(s)
            </dt>
            <dd className="col-span-7 md:col-span-8 flex flex-wrap justify-end gap-2">
              {project.reviewers.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium"
                >
                  {r}
                </span>
              ))}
            </dd>
          </div>

          {/* Viewers */}
          <div className="grid grid-cols-12 items-center py-3">
            <dt className="col-span-5 md:col-span-4 text-sm font-medium text-gray-500">
              Viewer(s)
            </dt>
            <dd className="col-span-7 md:col-span-8 flex flex-wrap justify-end gap-2">
              {project.viewers.map((v) => (
                <span
                  key={v}
                  className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium"
                >
                  {v}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-gray-700">
            <Clock className="w-4 h-4" />
          </div>
          Recent Activity
        </h2>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="pb-4 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    {activity.user && (
                      <span className="font-medium">{activity.user}</span>
                    )}
                    {activity.user && activity.action && " "}
                    {activity.action}
                    {activity.item && (
                      <span className="font-medium"> "{activity.item}"</span>
                    )}
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
