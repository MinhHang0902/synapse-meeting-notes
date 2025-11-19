"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilLine, X } from "lucide-react";
import { UpdateProfileRequest, UserInfoResponse } from "@/types/interfaces/user";

interface AccountModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserInfoResponse;
  onSave: (data: UpdateProfileRequest) => void;
}

export default function MyAccountModal({
  open,
  onOpenChange,
  user,
  onSave,
}: AccountModalProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);

  React.useEffect(() => {
    setName(user.name);
    setEditing(false);
  }, [user]);

  const canSave = name.trim().length > 0 && name.trim() !== user.name.trim();

  const close = () => {
    setEditing(false);
    onOpenChange(false);
  };

  const submit = async () => {
    if (!canSave) return;
    onSave({ name: name.trim() });
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
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => close()}
      />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-black text-white p-6 flex items-start justify-between rounded-t-2xl border-b border-white/10 relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center shrink-0 font-semibold">
              {(user.name?.trim()?.[0] || user.email?.trim()?.[0] || "U").toUpperCase()}
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

        <div className="p-6 space-y-8">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  readOnly={!editing}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={`flex-1 rounded-md px-3 py-2 text-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-gray-400 ${
                    !editing ? "bg-gray-100 cursor-not-allowed opacity-80" : ""
                  }`}
                />

                {!editing ? (
                  <Button
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="bg-black text-white hover:bg-black/90 gap-2 flex items-center"
                  >
                    <PencilLine className="w-4 h-4" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={!canSave}
                      onClick={submit}
                      className={`text-white px-4 ${
                        canSave ? "bg-black hover:bg-black/90" : "bg-gray-400 cursor-not-allowed"
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
                      className="px-6 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
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

          <div>
            <h4 className="text-gray-900 font-semibold text-base mb-1">
              System Role
            </h4>
            <p className="text-sm text-gray-600">{user.systemRole?.role_name} (read-only)</p>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold text-base mb-3">
              Projects
            </h4>
            <div className="space-y-3">
              {user.projectMembers.map((p) => (
                <div
                  key={p.project.project_id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                >
                  <span className="text-sm text-gray-800 font-medium">
                    {p.project.project_name}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold">
                    {p.projectRole.role_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-b-2xl">
          Account settings are managed by the administrator.
        </div>
      </div>
    </div>
  );
}
