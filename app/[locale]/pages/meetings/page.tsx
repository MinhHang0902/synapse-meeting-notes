"use client";

import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { MeetingMinutesList } from "@/components/meetings/meetings-list";

export default function MeetingMinutesPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Meeting Minutes
          </h2>

          <main className="flex-1 overflow-auto">
            {/* MeetingMinutesList KHÔNG có padding/margin ngang để canh lề thẳng với heading */}
            <MeetingMinutesList />
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
