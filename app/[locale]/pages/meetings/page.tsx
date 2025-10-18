"use client"

import ProtectedLayout from "@/components/layouts/ProtectedLayout"
import { MeetingMinutesList } from "@/components/meetings/meetings-list"

export default function MeetingMinutesPage() {
    return (
        <ProtectedLayout>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <main className="flex-1 overflow-auto">
                    <MeetingMinutesList />
                </main>
            </div>
        </ProtectedLayout>
    )
}
