import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import UploadMinute from "@/components/projects/project-detail/meeting-minute/upload-minute";


export default function ProjectUploadPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <UploadMinute />
        </div>
      </div>
    </ProtectedLayout>
  );
}
