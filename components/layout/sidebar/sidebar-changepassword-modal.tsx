"use client";

import React from "react";
import { Eye, EyeOff, X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordRequest } from "@/types/interfaces/user";

export default function ChangePasswordModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit?: (payload: ChangePasswordRequest) => void;
}) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showCur, setShowCur] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showCon, setShowCon] = React.useState(false);

  const canApply =
    currentPassword.length >= 6 &&
    newPassword.length >= 6 &&
    confirmPassword === newPassword &&
    currentPassword !== newPassword;

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCur(false);
    setShowNew(false);
    setShowCon(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const apply = () => {
    if (!canApply) return;
    console.log("currentPassword:", currentPassword);
    console.log("newPassword:", newPassword);
    onSubmit?.({ currentPassword, newPassword });
    handleClose(false);
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
        <div className="bg-black text-white p-6 flex items-start justify-between sticky top-0 z-20 rounded-t-2xl border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              < KeyRound className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Change Password</h2>
            </div>
            <p className="text-white/70 text-sm">
              Update your password to enhance account security
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={() => handleClose(false)}
            className="text-white/90 hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-white">
          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCur ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-md px-3 py-2 text-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-gray-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCur((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              >
                {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-md px-3 py-2 text-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-gray-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCon ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-md px-3 py-2 text-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-gray-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCon((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              >
                {showCon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="mt-1 text-xs text-red-600">
                Passwords do not match.
              </p>
            )}
            {newPassword.length > 0 && currentPassword === newPassword && (
              <p className="mt-1 text-xs text-red-600">
                New password must be different from current.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end gap-3 bg-white rounded-b-2xl">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="px-6 bg-transparent"
          >
            <X className="w-4 h-4 mr-2" />
            Discard
          </Button>
          <Button
            disabled={!canApply}
            onClick={apply}
            className={`px-6 text-white ${canApply
                ? "bg-black hover:bg-black/90"
                : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            < KeyRound className="w-4 h-4 mr-2" />
            Apply Change
          </Button>
        </div>
      </div>
    </div>
  );
}
