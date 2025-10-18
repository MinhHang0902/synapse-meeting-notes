import ProtectedLayout from "@/components/layouts/ProtectedLayout"
import { ProjectDetail } from "@/components/projects/project-detail/project-detail"

export default function ProjectDetailPage() {
    return (
        <ProtectedLayout>
            <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <ProjectDetail />
                </div>
            </div>
        </ProtectedLayout>
    )
}
