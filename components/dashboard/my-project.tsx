import { ArrowRight, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const projects = [
  {
    id: 1,
    title: "Financial Planning 2024",
    role: "MANAGER",
    roleColor: "text-blue-500",
    members: 12,
    lastActivity: "2h ago",
  },
  {
    id: 2,
    title: "Marketing Campaign Q4",
    role: "MANAGER",
    roleColor: "text-purple-500",
    members: 8,
    lastActivity: "2d ago",
  },
  {
    id: 3,
    title: "Product Launch Q2",
    role: "REVIEWER",
    roleColor: "text-emerald-500",
    members: 8,
    lastActivity: "5h ago",
  },
  {
    id: 4,
    title: "Tech Strategy Update",
    role: "VIEWER",
    roleColor: "text-orange-500",
    members: 15,
    lastActivity: "1d ago",
  },
];

export function MyProjects({ embedded = false }: { embedded?: boolean }) {
  const wrapperClass = embedded
    ? "p-0 bg-transparent border-0 shadow-none"
    : "p-6 bg-white rounded-2xl border border-gray-200 shadow-sm";

  return (
    <Card className={wrapperClass}>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">My Projects</h3>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-0.5">
                {project.title}
              </div>
              <div
                className={`text-xs font-semibold ${project.roleColor} mb-1`}
              >
                {project.role}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-3 h-3" />
                {project.members} members
              </div>
              <div className="text-xs text-gray-500">
                Last activity: {project.lastActivity}
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Open
            </Button>
          </div>
        ))}
      </div>
      
      {!embedded && (
        <Button className="w-full mt-6 rounded-xl" size="lg">
          View All Projects (12)
        </Button>
      )}
    </Card>
  );
}
