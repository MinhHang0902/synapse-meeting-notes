"use client";

import { useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

export default function AddUserModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit?: (payload: { fullName: string; email: string; role: "Admin" | "User" }) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Admin" | "User" | "">("");

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const canSubmit = !!fullName.trim() && emailValid && !!role;

  const reset = () => {
    setFullName("");
    setEmail("");
    setRole("");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const submit = () => {
    if (!canSubmit) return;
    const newUser = {
      fullName: fullName.trim(),
      email: email.trim(),
      role: role as "Admin" | "User",
    };
    onSubmit?.(newUser);
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal role="dialog">
      <div className="absolute inset-0 bg-black/50" onClick={() => handleClose(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-start justify-between sticky top-0 z-20 rounded-t-2xl border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Add New User</h2>
            </div>
            <p className="text-white/70 text-sm">Create a new account for your workspace</p>
          </div>
          <button
            aria-label="Close"
            onClick={() => handleClose(false)}
            className="text-white/90 hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 bg-white">
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enter full name (e.g., John Doe)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
            />
            {!emailValid && email.length > 0 && (
              <p className="mt-2 text-xs text-red-600">Please enter a valid email.</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select value={role} onValueChange={(v: "Admin" | "User") => setRole(v)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select role">
                  {role ? role : "Select role"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <Button
            variant="outline"
            className="px-6 bg-transparent"
            onClick={() => handleClose(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={submit}
            className={`px-6 text-white ${
              canSubmit ? "bg-black hover:bg-black/90" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
}
