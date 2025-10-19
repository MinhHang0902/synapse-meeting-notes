"use client"

import React, { useMemo, useState } from "react"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserPlus,
  UserRoundPlus,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import AddUserModal from "./add-user-modal"
import EditUserModal from "./edit-user-modal"

export interface UserRow {
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

/* =========================
   UsersSettings (with add & edit)
   ========================= */
export function UsersSettings() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [openAdd, setOpenAdd] = useState(false)

  // Edit
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

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

  return (
    <div className="space-y-6">
      {/* Title + Search/Filters row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Synapse User List</h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 bg-white border-gray-300 focus-visible:ring-black/10"
            />
          </div>

          <Button variant="outline" className="border-gray-300 bg-transparent hover:bg-black hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Role
          </Button>
          <Button variant="outline" className="border-gray-300 bg-transparent hover:bg-black hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Status
          </Button>
          <Button className="bg-black hover:bg-black/80 text-white">Search</Button>

          {/* Top actions */}
          <div className="flex items-center justify-end">
            <Button className="bg-black hover:bg-black/80 text-white" onClick={() => setOpenAdd(true)}>
              <UserPlus className="w-4 h-4 mr-2 text-white" />
              Add New User
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Last Login</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white font-medium text-xs`}>
                      {user.initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset
                      ${user.role === "Admin"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-indigo-50 text-indigo-700 ring-indigo-200"}`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset
                      ${user.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-zinc-100 text-zinc-700 ring-zinc-200"}`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">{user.lastLogin}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.created}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors rounded p-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setOpenEdit(true)
                        }}
                      >
                        Edit user
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>Deactivate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" disabled>
                        Remove user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            className={`w-8 h-8 rounded transition-colors ${currentPage === page ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"}`}
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

      {/* Add User Popup */}
      <AddUserModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSubmit={(payload) => {
          // TODO: call API create user tại đây
          console.log("Create user payload:", payload)
        }}
      />

      {/* Edit User Popup */}
      <EditUserModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        user={selectedUser}
        onSubmit={(payload) => {
          // TODO: call API update user tại đây
          console.log("Update user payload:", payload)
        }}
      />
    </div>
  )
}
