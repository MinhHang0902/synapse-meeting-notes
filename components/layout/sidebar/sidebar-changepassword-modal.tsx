"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import React from "react";

export default function ChangePasswordModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit?: (payload: { currentPassword: string; newPassword: string }) => void;
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

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const apply = () => {
    if (!canApply) return;
    onSubmit?.({ currentPassword, newPassword });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="p-0 overflow-hidden border-0 shadow-2xl max-w-md">
        <div className="bg-gradient-to-r from-[#7b4397] to-[#9f5be8] px-5 py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.5" />
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-white text-lg">Change Password</DialogTitle>
              <DialogDescription className="text-white/70 text-xs">
                Update password for enhanced account security.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-5 pt-5 pb-4">
          <div className="space-y-4">
            {/* Current password */}
            <div>
              <label className="text-sm text-gray-800">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <Input
                  type={showCur ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCur((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showCur ? "Hide password" : "Show password"}
                >
                  {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="text-sm text-gray-800">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm text-gray-800">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <Input
                  type={showCon ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCon((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showCon ? "Hide password" : "Show password"}
                >
                  {showCon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                <p className="mt-1 text-xs text-rose-600">Passwords do not match.</p>
              )}
              {newPassword.length > 0 && currentPassword === newPassword && (
                <p className="mt-1 text-xs text-rose-600">New password must be different from current.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={close}
              className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            >
              Discard
            </Button>
            <Button
              disabled={!canApply}
              onClick={apply}
              className="bg-[#4b2b5d] hover:opacity-95 text-white disabled:opacity-50"
            >
              Apply Change
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}