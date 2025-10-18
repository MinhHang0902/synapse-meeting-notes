import { MyProjects } from "@/components/dashboard/my-project";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Workspace Summary
          </h2>

          <StatsCards embedded />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
            <RecentActivity embedded />
            <MyProjects embedded />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
