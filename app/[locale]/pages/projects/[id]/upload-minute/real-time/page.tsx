import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import RealtimeMeeting from "@/components/projects/project-detail/meeting-minute/record-realtime";

export default function RealtimeMeetingPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <RealtimeMeeting />
        </div>
      </div>
    </ProtectedLayout>
  );
}
