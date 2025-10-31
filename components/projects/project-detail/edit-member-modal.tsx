"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog, X } from "lucide-react";
import { Member } from "./project-members";

export default function EditMemberModal({
  open,
  onOpenChange,
  member,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: Member | null;
  onSave?: (payload: { id: number; role: "Manager" | "Reviewer" | "Viewer" }) => void;
}) {
  const [role, setRole] = useState<"Manager" | "Reviewer" | "Viewer" | "">("");

  useEffect(() => {
    if (member) {
      const current =
        (["Manager", "Reviewer", "Viewer"] as const).find(
          (r) => r.toLowerCase() === member.role.toLowerCase()
        ) || "Viewer";
      setRole(current);
    } else {
      setRole("");
    }
  }, [member]);

  const canSave = Boolean(role) && Boolean(member);

  const handleClose = (v: boolean) => {
    onOpenChange(v);
  };

  const handleSave = () => {
    if (!canSave || !member) return;
    onSave?.({ id: member.id, role: role as "Manager" | "Reviewer" | "Viewer" });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => handleClose(false)}
      />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-start justify-between sticky top-0 z-20 rounded-t-2xl border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCog className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Edit Member</h2>
            </div>
            <p className="text-white/70 text-sm">Update member role information</p>
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
          {/* Full Name (read-only) */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              value={member?.name ?? ""}
              readOnly
              className="w-full h-9 px-3 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-lg cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              value={member?.email ?? ""}
              readOnly
              className="w-full h-9 px-3 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-lg cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Role (editable) */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(v: "Manager" | "Reviewer" | "Viewer") => setRole(v)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select role">
                  {role ? role : "Select role"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Reviewer">Reviewer</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <Button
            variant="outline"
            className="px-6 bg-transparent hover:bg-gray-100"
            onClick={() => handleClose(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            onClick={handleSave}
            className={`px-6 text-white flex items-center ${
              canSave
                ? "bg-black hover:bg-black/90"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <UserCog className="w-4 h-4 mr-2" />
            Save Change
          </Button>
        </div>
      </div>
    </div>
  );
}
