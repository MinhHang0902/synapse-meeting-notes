"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import EditMemberModal from "./edit-member-modal";
import { useParams } from "next/navigation";
import { ProjectsApi } from "@/lib/api/project";

export type Member = {
  id: number; // giả định = user_id (phù hợp với delete-member nếu backend nhận user_id)
  name: string;
  email: string;
  // role: "Manager" | "Reviewer" | "Viewer";
  role: string;
  avatar: string;
  avatarColor: string;
};

const roleUI2API = (r: Member["role"]) => (r === "Manager" ? "MANAGER" : r === "Reviewer" ? "REVIEWER" : "VIEWER");

export default function ProjectMembers({ teamMembers }: { teamMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(teamMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Member["role"] | undefined>(undefined);

  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = /^\S+@\S+\.\S+$/.test(email);

  const [editing, setEditing] = useState<Member | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const { id } = useParams();

  const nextId = useMemo(() => (members.length ? Math.max(...members.map((m) => m.id)) + 1 : 1), [members]);

  const invite = async () => {
    if (!emailValid || !role) return;
    try {
      await ProjectsApi.addMember(Number(id), { email, role: roleUI2API(role) });

      const nameFromEmail =
        email.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "New Member";
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
        id: nextId, // UI id; nếu backend trả id membership, có thể refetch để đồng bộ
        name: nameFromEmail,
        email,
        role,
        avatar: initials || "NM",
        avatarColor,
      };

      setMembers((prev) => [newMem, ...prev]);
      setEmail("");
      setRole(undefined);
      setEmailTouched(false);
    } catch (e) {
      console.error("Add member failed:", e);
    }
  };

  const deleteMember = async (memberId: number) => {
    try {
      await ProjectsApi.deleteMember(Number(id), memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      console.error("Delete member failed:", e);
    }
  };

  const openEditFor = (m: Member) => {
    setEditing(m);
    setOpenEdit(true);
  };

  const handleSaveEdit = async (payload: { id: number; role: "Manager" | "Reviewer" | "Viewer" }) => {
    try {
      const mem = members.find((m) => m.id === payload.id);
      if (!mem) return;
      await ProjectsApi.updateMember(Number(id), { email: mem.email, role: roleUI2API(payload.role) });
      setMembers((prev) => prev.map((m) => (m.id === payload.id ? { ...m, role: payload.role } : m)));
    } catch (e) {
      console.error("Update member failed:", e);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Invite section */}
      <div>
        <h3 className="text/base font-semibold text-gray-900">Invite members</h3>
        <p className="text-sm text-gray-500 mt-1">
          Easily add new members to your team by entering their email addresses below. Once invited, they'll receive an email with a link to join.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="sm:flex-1">
            <input
              type="text"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`
                w-full h-9 px-3 text-sm
                bg-white text-gray-900 placeholder:text-gray-400
                rounded-lg
                focus:outline-none
                transition-colors
                ${
                  !emailValid && emailTouched 
                    ? "border border-red-500 focus:border-red-500" 
                    : "border border-gray-200 focus:border-gray-400"
                }
              `}
            />
            {!email && emailTouched && <p className="text-xs text-red-500 mt-1">Email is required</p>}
            {email && !emailValid && emailTouched && <p className="text-xs text-red-500 mt-1">Invalid email address</p>}
          </div>

          <Select value={role} onValueChange={(v: Member["role"]) => setRole(v)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue>{role ? role : "Select Role"}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Viewer">Viewer</SelectItem>
              <SelectItem value="Reviewer">Reviewer</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
            </SelectContent>
          </Select>

          <Button className="h-9 bg-black hover:bg-black/90 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed" onClick={invite} disabled={!emailValid || !role}>
            Invite People
          </Button>
        </div>
      </div>

      <div className="mt-6 mb-4 h-px bg-gray-200" />

      <h3 className="text-base font-semibold text-gray-900 mb-3">People with access</h3>

      <div className="divide-y divide-gray-100">
        {members.map((m) => (
          <div key={m.id} className="py-3 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-semibold ${m.avatarColor}`}>{m.avatar}</div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{m.name}</div>
                <div className="text-xs text-gray-500 truncate">{m.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">{m.role}</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors" aria-label={`More actions for ${m.name}`}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={6} className="w-44 min-w-0 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 transition-colors focus:outline-none">
                  <DropdownMenuLabel className="px-3 py-1.5 text-sm font-semibold text-black-500">Actions</DropdownMenuLabel>

                  <DropdownMenuItem onClick={() => openEditFor(m)} className="h-9 flex items-center px-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                    Edit Member
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => deleteMember(m.id)} className="h-9 flex items-center px-3 rounded-md text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors">
                    Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <EditMemberModal open={openEdit} onOpenChange={setOpenEdit} member={editing} onSave={handleSaveEdit} />
    </div>
  );
}
