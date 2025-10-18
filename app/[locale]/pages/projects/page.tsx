import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { ProjectsList } from "@/components/projects/project-list";

export default function ProjectsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <ProjectsList />
        </div>
      </div>
    </ProtectedLayout>
  );
}
