"use client"

import { useMemo, useState } from "react"
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

/* =========================
   Popup Add User (UI-only)
   ========================= */
function AddUserModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit?: (payload: { fullName: string; email: string; role: "Admin" | "User" }) => void
}) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"Admin" | "User" | "">("")

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  )
  const canSubmit = fullName.trim() && emailValid && role

  const reset = () => {
    setFullName("")
    setEmail("")
    setRole("")
  }

  const handleClose = (v: boolean) => {
    if (!v) reset()
    onOpenChange(v)
  }

  const submit = () => {
    if (!canSubmit) return
    onSubmit?.({
      fullName: fullName.trim(),
      email: email.trim(),
      role: role as "Admin" | "User",
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 overflow-hidden border-0 shadow-2xl max-w-md"
      >
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-[#7b4397] to-[#9f5be8] px-5 py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <UserRoundPlus className="w-4 h-4" />
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-white text-lg">Add New User</DialogTitle>
              <DialogDescription className="text-white/70 text-xs">
                Create a new account for your workspace
              </DialogDescription>
            </DialogHeader>
          </div>
          <button
            aria-label="Close"
            onClick={() => handleClose(false)}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-white hover:bg-white/25"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="bg-white px-5 pt-5 pb-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-800">
                Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Enter full name (e.g., John Doe)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 bg-white"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-800">
                Email Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white"
              />
              {!emailValid && email.length > 0 && (
                <p className="mt-1 text-xs text-rose-600">Please enter a valid email.</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-gray-800">
                Role <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(v: "Admin" | "User") => setRole(v)}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!canSubmit}
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#2F6EEB] to-[#2A44A9] text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* =========================
   UsersSettings (with popup)
   ========================= */
export function UsersSettings() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [openAdd, setOpenAdd] = useState(false)

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
        <h2 className="text-xl font-semibold text-gray-900">
          Synapse User List
        </h2>

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

          <Button
            variant="outline"
            className="border-gray-300 bg-transparent hover:bg-black hover:text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Role
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 bg-transparent hover:bg-black hover:text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Status
          </Button>
          <Button className="bg-black hover:bg-black/80 text-white">Search</Button>

          {/* Top actions */}
          <div className="flex items-center justify-end">
            <Button
              className="bg-black hover:bg-black/80 text-white"
              onClick={() => setOpenAdd(true)}
            >
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

                {/* Role badge */}
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

                {/* Status badge */}
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
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
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
    </div>
  )
}
