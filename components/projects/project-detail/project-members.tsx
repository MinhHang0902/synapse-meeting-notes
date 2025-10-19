"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import EditMemberModal from "./edit-member-modal";

export type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  avatarColor: string;
};

export default function ProjectMembers({
  teamMembers,
}: {
  teamMembers: Member[];
}) {
  const [members, setMembers] = useState<Member[]>(teamMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);

  // Email validation
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = /^\S+@\S+\.\S+$/.test(email);

  // Edit modal state
  const [editing, setEditing] = useState<Member | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const nextId = useMemo(
    () => (members.length ? Math.max(...members.map((m) => m.id)) + 1 : 1),
    [members]
  );

  const invite = () => {
    if (!emailValid || !role) return;

    const nameFromEmail =
      email.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
      "New Member";
    const initials = nameFromEmail
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase();

    const palette = ["bg-blue-500", "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-emerald-500"];
    const avatarColor = palette[Math.floor(Math.random() * palette.length)];

    const newMem: Member = {
      id: nextId,
      name: nameFromEmail,
      email,
      role: role ?? "Viewer",
      avatar: initials || "NM",
      avatarColor,
    };

    setMembers((prev) => [newMem, ...prev]);
    setEmail("");
    setRole(undefined);
    setEmailTouched(false);
  };

  const deleteMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const openEditFor = (m: Member) => {
    setEditing(m);
    setOpenEdit(true);
  };

  const handleSaveEdit = (payload: { id: number; role: "Manager" | "Reviewer" | "Viewer" }) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === payload.id ? { ...m, role: payload.role } : m))
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Invite section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">Invite members</h3>
        <p className="text-sm text-gray-500 mt-1">
          Easily add new members to your team by entering their email addresses below. Once invited,
          they’ll receive an email with a link to join.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {/* Email Input */}
          <div className="sm:flex-1">
            <Input
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`sm:flex-1 ${!emailValid && emailTouched ? "border-red-500" : ""}`}
            />
            {!email && emailTouched && (
              <p className="text-xs text-red-500 mt-1">Email is required</p>
            )}
            {email && !emailValid && emailTouched && (
              <p className="text-xs text-red-500 mt-1">Invalid email address</p>
            )}
          </div>

          {/* Role Select */}
          <Select value={role} onValueChange={(v) => setRole(v)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue>{role ? role : "Select Role"}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Viewer">Viewer</SelectItem>
              <SelectItem value="Reviewer">Reviewer</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
            </SelectContent>
          </Select>

          {/* Invite Button */}
          <Button
            className="h-9 bg-black hover:bg-black/90 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={invite}
            disabled={!emailValid || !role}
          >
            Invite People
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 mb-4 h-px bg-gray-200" />

      {/* People list */}
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        People with access
      </h3>

      <div className="divide-y divide-gray-100">
        {members.map((m) => (
          <div key={m.id} className="py-3 flex items-center gap-3 justify-between">
            {/* Left: avatar + name + email */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-semibold ${m.avatarColor}`}
              >
                {m.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {m.name}
                </div>
                <div className="text-xs text-gray-500 truncate">{m.email}</div>
              </div>
            </div>

            {/* Right: role pill + menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">
                {m.role}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                    aria-label={`More actions for ${m.name}`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6} className="w-44">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => openEditFor(m)}>
                    Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700"
                    onClick={() => deleteMember(m.id)}
                  >
                    Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Member Modal */}
      <EditMemberModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        member={editing}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
