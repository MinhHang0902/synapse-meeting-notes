"use client"

import ProtectedLayout from "@/components/layouts/ProtectedLayout"
import { UsersSettings } from "@/components/settings/usersettings"
import { useState } from "react"

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("users")

    return (
        <ProtectedLayout>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <main className="flex-1 p-8">
                        <div className="flex gap-8 border-b border-gray-200 mb-8">
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`pb-4 px-2 font-medium transition-colors ${activeTab === "users" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>👤</span> Users Settings
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("system")}
                                className={`pb-4 px-2 font-medium transition-colors ${activeTab === "system"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>⚙️</span> System Settings
                                </span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "users" && <UsersSettings />}
                        {activeTab === "system" && (
                            <div className="text-center py-12 text-gray-500">System Settings content coming soon</div>
                        )}
                    </main>
                </div>
        </ProtectedLayout>

    )
}
