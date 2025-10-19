"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PencilLine, X } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function MyAccountModal({
  open, onOpenChange, user,
  onSave
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: { name: string; email: string; avatarUrl?: string };
  onSave?: (name: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(user.name);

  React.useEffect(() => {
    setName(user.name);
    setEditing(false);
  }, [user]);

  const canSave = name.trim().length > 0 && name.trim() !== user.name.trim();

  const close = () => {
    setEditing(false);
    onOpenChange(false);
  };

  const submit = () => {
    if (!canSave) return;
    onSave?.(name.trim());
    setEditing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-0 shadow-2xl max-w-2xl">
        <div className="relative bg-gradient-to-r from-[#7b4397] to-[#9f5be8] px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/40">
                <Image
                  alt="avatar"
                  src={user.avatarUrl || "/placeholder.svg"}
                  fill
                  sizes="64px"
                />
              </div>
              <div className="flex flex-col gap-2 min-w-[260px]">
                <Input
                  value={name}
                  readOnly={!editing}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "bg-white/15 text-white placeholder:text-white/70 border-white/20",
                    "focus-visible:ring-white/40",
                    !editing && "opacity-90 cursor-not-allowed"
                  )}
                  placeholder="Your name"
                />
                <Input
                  value={user.email}
                  readOnly
                  className="bg-white/10 text-white/90 border-white/15 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!editing ? (
                <Button
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="bg-black/40 hover:bg-black/50 text-white gap-2"
                >
                  <PencilLine className="w-4 h-4" /> Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    disabled={!canSave}
                    onClick={submit}
                    className="bg-gradient-to-r from-[#2F6EEB] to-[#2A44A9] text-white hover:opacity-95 disabled:opacity-50"
                  >
                    Save Change
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setName(user.name); setEditing(false); }}
                    className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <button
            aria-label="Close"
            onClick={close}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-white hover:bg-white/25"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white px-6 py-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-[#1f3b71] font-semibold">System Role</h4>
              <p className="text-sm text-gray-600 mt-1">Admin (read-only)</p>
            </div>

            <div>
              <h4 className="text-[#1f3b71] font-semibold">Projects</h4>
              <div className="mt-3 space-y-3">
                {["Project Alpha", "Project Beta", "Project Gamma"].map((p, i) => (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                  >
                    <span className="text-sm text-[#3163a1] font-medium">{p}</span>
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold">
                      {i === 0 ? "Manager" : i === 1 ? "Reviewer" : "Viewer"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}