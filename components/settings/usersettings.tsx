"use client"

import { useState } from "react"
import { Search, Filter, ChevronLeft, ChevronRight, MoreVertical, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UserRow {
  id: string
  name: string
  email: string
  role: "Admin" | "User"
  status: "Active" | "Inactive"
  lastLogin: string
  created: string
  initials: string
  color: string
}

const USERS: UserRow[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.johnson@company.com", role: "Admin", status: "Active", lastLogin: "2024-02-09 15:30", created: "2024-01-01", initials: "SJ", color: "bg-blue-500" },
  { id: "2", name: "Mike Chen", email: "mike.chen@company.com", role: "Admin", status: "Inactive", lastLogin: "2024-02-09 08:30", created: "2024-01-05", initials: "MC", color: "bg-pink-500" },
  { id: "3", name: "David Kim", email: "david.kim@company.com", role: "User", status: "Active", lastLogin: "2024-02-01 16:45", created: "2024-01-10", initials: "DK", color: "bg-cyan-500" },
  { id: "4", name: "Lisa Wong", email: "lisa.wong@company.com", role: "User", status: "Active", lastLogin: "2024-02-09 08:30", created: "2024-01-05", initials: "LW", color: "bg-orange-500" },
  { id: "5", name: "Alex Rodriguez", email: "alex.rodriguez@company.com", role: "User", status: "Active", lastLogin: "2024-02-09 08:30", created: "2024-01-05", initials: "AR", color: "bg-blue-200" },
  { id: "6", name: "John Smith", email: "john.smith@company.com", role: "User", status: "Inactive", lastLogin: "2024-02-09 08:30", created: "2024-01-05", initials: "JS", color: "bg-orange-200" },
]

type TabKey = "users" | "system"

export function UsersSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>("users")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const itemsPerPage = 6
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  const TabBtn = ({
    tab,
    icon: Icon,
    label,
  }: {
    tab: TabKey
    icon: typeof User
    label: string
  }) => {
    const isActive = activeTab === tab
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`group relative -mb-px flex items-center gap-2 pb-3 text-sm font-medium transition-colors
          ${isActive ? "text-black" : "text-gray-700 hover:text-black"}`}
      >
        <Icon
          className={`h-4 w-4 transition-colors
            ${isActive ? "text-black" : "text-gray-400 group-hover:text-black"}`}
        />
        {label}
        {/* underline */}
        <span
          className={`pointer-events-none absolute inset-x-0 -bottom-px h-[2px] rounded
            ${isActive ? "bg-black" : "bg-transparent group-hover:bg-black/60"}`}
        />
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs header (black on hover/active) */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-6">
          <TabBtn tab="users" icon={User} label="Users Settings" />
          <TabBtn tab="system" icon={Settings} label="System Settings" />
        </div>
      </div>

      {/* Users tab content */}
      {activeTab === "users" && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Users Settings</h2>
              <p className="text-gray-600">Account management and user authorization</p>
            </div>
            <Button className="bg-black hover:bg-black/80 text-white">
              <span className="mr-2">👤</span> Add New User
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-white border-gray-300 focus-visible:ring-black/10"
              />
            </div>
            <Button
              variant="outline"
              className="border-gray-300 bg-transparent hover:bg-black hover:text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter by Role
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 bg-transparent hover:bg-black hover:text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter by Status
            </Button>
            <Button className="bg-black hover:bg-black/80 text-white">Search</Button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white font-semibold text-sm`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === "Admin" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          user.status === "Active" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.created}</td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-black transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="p-2 rounded transition-colors disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded transition-colors ${
                  currentPage === page ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="p-2 rounded transition-colors disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* System tab content (placeholder) */}
      {activeTab === "system" && (
        <div className="rounded-lg border border-gray-200 p-6 text-gray-700">
          <h2 className="text-2xl font-semibold mb-2">System Settings</h2>
          <p>Configure environment, authentication, notification channels…</p>
        </div>
      )}
    </div>
  )
}
