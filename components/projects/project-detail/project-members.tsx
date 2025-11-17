"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import EditMemberModal from "./edit-member-modal";
import { useParams } from "next/navigation";
import { ProjectsApi } from "@/lib/api/project";
import ConfirmDeleteDialog from "@/components/confirm-dialog";
import { UsersApi } from "@/lib/api/user";

export type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  avatarColor: string;
};

interface SelectableUser {
  id: number;
  name: string;
  email: string;
}

const roleUI2API = (r: Member["role"]) =>
  r === "Manager" ? "MANAGER" : r === "Reviewer" ? "REVIEWER" : "VIEWER";

export default function ProjectMembers({ teamMembers }: { teamMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(teamMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Member["role"] | undefined>(undefined);

  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = /^\S+@\S+\.\S+$/.test(email);

  const [editing, setEditing] = useState<Member | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const [availableUsers, setAvailableUsers] = useState<SelectableUser[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { id } = useParams();

  const nextId = useMemo(
    () => (members.length ? Math.max(...members.map((m) => m.id)) + 1 : 1),
    [members]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await UsersApi.getAll({
          pageIndex: 1,
          pageSize: 100,
          status: "ACTIVE",
        });
        const users: SelectableUser[] =
          res.data?.map((u) => ({
            id: u.user_id,
            name: u.name,
            email: u.email,
          })) ?? [];
        setAvailableUsers(users);
      } catch (e) {
        console.error("Failed to load member list:", e);
      }
    })();
  }, []);

  const findRoleByEmail = (email: string): Member["role"] | null => {
    const normalized = email.trim().toLowerCase();
    const found = members.find((m) => m.email.toLowerCase() === normalized);
    return found ? found.role : null;
  };

  const ensureUniqueRole = (email: string, targetRole: Member["role"]) => {
    const existingRole = findRoleByEmail(email);
    if (!existingRole) {
      setErrorMessage(null);
      return true;
    }
    if (existingRole === targetRole) {
      setErrorMessage(`${email} has already been added with the role ${existingRole}.`);
      return false;
    }
    setErrorMessage(
      `Email ${email} is currently assigned the role ${existingRole}. Each member can only have one role.`
    );
    return false;
  };

  const invite = async () => {
    if (!emailValid || !role) return;

    if (!ensureUniqueRole(email, role)) return;

    try {
      await ProjectsApi.addMember(Number(id), {
        email,
        role: roleUI2API(role),
      });

      const nameFromEmail =
        email
          .split("@")[0]
          ?.replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) || "New Member";

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
        role,
        avatar: initials,
        avatarColor,
      };

      setMembers((prev) => [newMem, ...prev]);

      setEmail("");
      setRole(undefined);
      setEmailTouched(false);
      setErrorMessage(null);
    } catch (e) {
      console.error("Add member failed:", e);
    }
  };

  const addFromDropdown = (user: SelectableUser) => {
    setEmail(user.email);
    setEmailTouched(true);
    setErrorMessage(null);
  };

  const requestDelete = (member: Member) => {
    setMemberToDelete(member);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      setDeleting(true);
      await ProjectsApi.deleteMember(Number(id), memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
    } catch (e) {
      console.error("Delete member failed:", e);
    } finally {
      setDeleting(false);
      setMemberToDelete(null);
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
      await ProjectsApi.updateMember(Number(id), {
        email: mem.email,
        role: roleUI2API(payload.role),
      });
      setMembers((prev) => prev.map((m) => (m.id === payload.id ? { ...m, role: payload.role } : m)));
    } catch (e) {
      console.error("Update member failed:", e);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text/base font-semibold text-gray-900">Invite members</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Easily add new members to your team by entering their email or selecting from the list.
      </p>

      {errorMessage && (
        <div className="mt-3 mb-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {errorMessage}
        </div>
      )}
      <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                className={`w-full h-9 pl-3 pr-8 text-sm bg-white text-gray-900 border rounded-lg
                  ${!emailValid && emailTouched ? "border-red-500" : "border-gray-200"}`}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {availableUsers.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      No users
                    </div>
                  )}
                  {availableUsers.map((u) => (
                    <DropdownMenuItem key={u.id} onClick={() => addFromDropdown(u)}>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* HẾT PHẦN SỬA */}

            {!email && emailTouched && (
              <p className="text-xs text-red-500 mt-1">
                Email is required
              </p>
            )}
            {email && !emailValid && emailTouched && (
              <p className="text-xs text-red-500 mt-1">
                Invalid email address
              </p>
            )}
          </div>

        <Select value={role} onValueChange={(v: Member["role"]) => setRole(v)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Select Role">{role}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="Viewer">Viewer</SelectItem>
            <SelectItem value="Reviewer">Reviewer</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="h-9 bg-black hover:bg-black/90 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={invite}
          disabled={!emailValid || !role}
        >
          Invite People
        </Button>
      </div>
      
      <div className="mt-6 mb-4 h-px bg-gray-200" />
      <h3 className="text-base font-semibold text-gray-900 mb-3">People with access</h3>

      <div className="divide-y divide-gray-100">
        {members.map((m) => (
          <div key={m.id} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-semibold ${m.avatarColor}`}
              >
                {m.avatar}
              </div>

              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{m.name}</div>
                <div className="text-xs text-gray-500 truncate">{m.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">
                {m.role}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={6} className="w-44 p-1.5">
                  <DropdownMenuItem onClick={() => openEditFor(m)}>
                    Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => requestDelete(m)}
                    className="text-red-600 focus:text-red-700"
                  >
                    Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <EditMemberModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        member={editing}
        onSave={handleSaveEdit}
      />

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Warning"
        description={
          memberToDelete
            ? `Do you really want to delete "${memberToDelete.name}"? This action cannot be undone.`
            : ""
        }
        cancelText="Cancel"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setMemberToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
