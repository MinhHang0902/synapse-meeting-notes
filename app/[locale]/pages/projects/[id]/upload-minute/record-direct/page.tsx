import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import RecordDirect from "@/components/projects/project-detail/meeting-minute/record-direct";

export default function RecordDirectPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <RecordDirect />
        </div>
      </div>
    </ProtectedLayout>
  );
}
