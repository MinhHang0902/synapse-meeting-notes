"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PencilLine, X } from "lucide-react";

export default function MyAccountModal({
  open,
  onOpenChange,
  user,
  onSave,
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => close()}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-start justify-between rounded-t-2xl border-b border-white/10 relative">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/30">
              <Image
                alt="avatar"
                src={user.avatarUrl || "/placeholder.svg"}
                fill
                sizes="64px"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">My Account</h2>
              <p className="text-white/70 text-sm">
                Manage your account information
              </p>
            </div>
          </div>

          <button
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-white hover:bg-white/25 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Profile Section */}
          <div className="flex items-start gap-5">
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  readOnly={!editing}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={`w-full rounded-md px-3 py-2 text-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-gray-400 ${
                    !editing ? "bg-gray-100 cursor-not-allowed opacity-80" : ""
                  }`}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-1 block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full rounded-md px-3 py-2 text-sm border border-gray-200 bg-gray-100 text-gray-900 placeholder:text-gray-400 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Edit Buttons */}
            <div className="flex flex-col gap-2">
              {!editing ? (
                <Button
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="bg-black text-white hover:bg-black/90 gap-2"
                >
                  <PencilLine className="w-4 h-4" /> Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    disabled={!canSave}
                    onClick={submit}
                    className={`text-white px-4 ${
                      canSave
                        ? "bg-black hover:bg-black/90"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Save Change
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setName(user.name);
                      setEditing(false);
                    }}
                    className="border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Role Section */}
          <div>
            <h4 className="text-gray-900 font-semibold text-base mb-1">
              System Role
            </h4>
            <p className="text-sm text-gray-600">Admin (read-only)</p>
          </div>

          {/* Project List */}
          <div>
            <h4 className="text-gray-900 font-semibold text-base mb-3">
              Projects
            </h4>
            <div className="space-y-3">
              {["Project Alpha", "Project Beta", "Project Gamma"].map(
                (p, i) => (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                  >
                    <span className="text-sm text-gray-800 font-medium">
                      {p}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold">
                      {i === 0
                        ? "Manager"
                        : i === 1
                        ? "Reviewer"
                        : "Viewer"}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-b-2xl">
          Account settings are managed by the administrator.
        </div>
      </div>
    </div>
  );
}
