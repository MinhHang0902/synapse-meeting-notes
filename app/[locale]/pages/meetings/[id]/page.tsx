"use client"

import ProtectedLayout from "@/components/layouts/ProtectedLayout"
import { MinuteDetailPage } from "@/components/meetings/meeting-detail"

export default function MinuteDetail() {
  return (
    <ProtectedLayout>
        <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <MinuteDetailPage />
        </div>
      </div>
    </ProtectedLayout> 
  )
}
