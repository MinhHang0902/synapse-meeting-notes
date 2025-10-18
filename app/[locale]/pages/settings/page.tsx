"use client"

import ProtectedLayout from "@/components/layouts/ProtectedLayout"
import { UsersSettings } from "@/components/settings/usersettings"

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <UsersSettings />
        </div>
      </div>
    </ProtectedLayout>
  )
}
