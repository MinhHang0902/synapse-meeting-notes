"use client";

import { useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { ROLE_TO_API, type CreateUserRequest, type CreateUserResponse, type RoleUI } from "@/types/interfaces/user";


export default function AddUserModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (payload: CreateUserRequest) => Promise<CreateUserResponse | void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleUI, setRoleUI] = useState<RoleUI | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const canSubmit = !!name.trim() && emailValid && !!roleUI && !submitting;

  const reset = () => {
    setName("");
    setEmail("");
    setRoleUI("");
    setErrorMsg(null);
    setSubmitting(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const submit = async (): Promise<void> => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      //chuẩn hóa input
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: ROLE_TO_API[roleUI],
      };

      let created: CreateUserResponse | void;

      //cha tự gọi API và có thể trả về CreateUserResponse
      created = await onSubmit(payload);

      //thành công
      reset();
      onOpenChange(false);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (status === 412) {
        setErrorMsg(
          typeof serverMsg === "string"
            ? serverMsg
            : "Precondition failed (412). Vui lòng kiểm tra lại dữ liệu — có thể email đã tồn tại hoặc role không hợp lệ."
        );
      } else if (status === 400) {
        setErrorMsg(
          typeof serverMsg === "string"
            ? serverMsg
            : "Bad request (400). Vui lòng kiểm tra dữ liệu nhập."
        );
      } else {
        setErrorMsg(
          typeof serverMsg === "string"
            ? serverMsg
            : `Request failed${status ? ` (status ${status})` : ""}.`
        );
      }

      console.error("Create user failed:", {
        status,
        data: err?.response?.data,
        err,
      });
    } finally {
      setSubmitting(false);
    }
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
            <input
              type="text"
              placeholder="Enter full name (e.g., John Doe)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full h-9 px-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <input
              type="email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full h-9 px-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-60"
            />
            {!emailValid && email.length > 0 && (
              <p className="mt-2 text-xs text-red-600">Please enter a valid email.</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select value={roleUI} onValueChange={(v: RoleUI) => setRoleUI(v)}>
              <SelectTrigger className="bg-white disabled:opacity-60" disabled={submitting}>
                <SelectValue placeholder="Select role">
                  {roleUI || "Select role"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <Button
            variant="outline"
            className="px-6 bg-transparent"
            onClick={() => handleClose(false)}
            disabled={submitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={submit}
            className={`px-6 text-white ${canSubmit ? "bg-black hover:bg-black/90" : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {submitting ? "Adding..." : "Add User"}
          </Button>
        </div>
      </div>
    </div>
  );
}
