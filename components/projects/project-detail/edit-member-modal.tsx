"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, X } from "lucide-react";
import React, { useState } from "react";
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

  React.useEffect(() => {
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden border-0 shadow-2xl max-w-md">
        {/* Header gradient tím */}
        <div className="relative bg-gradient-to-r from-[#7b4397] to-[#9f5be8] px-5 py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <UserCog className="w-4 h-4" />
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-white text-lg">Edit Member</DialogTitle>
              <DialogDescription className="text-white/70 text-xs">
                Update member role
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
                value={member?.name ?? ""}
                readOnly
                className="mt-1 bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-800">
                Email Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={member?.email ?? ""}
                readOnly
                className="mt-1 bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-800">
                Role <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(v: "Manager" | "Reviewer" | "Viewer") => setRole(v)}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select Role" />
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
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!canSave}
              onClick={handleSave}
              className="inline-flex items-center rounded-md bg-gradient-to-r from-[#2F6EEB] to-[#2A44A9] text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              Save Change
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}