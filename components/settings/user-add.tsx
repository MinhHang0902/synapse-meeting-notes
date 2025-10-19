"use client"
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "../ui/dialog";
import { UserPlus, UserRoundPlus, X } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

/* =========================
   Popup Add User (UI-only)
   ========================= */
export default function AddUserModal({
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