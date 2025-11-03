"use client";

import React, { useEffect, useState } from "react";
import {
  Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  MoreVertical, UserPlus, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";

import AddUserModal from "./add-user-modal";
import EditUserModal from "./edit-user-modal";

import { UsersApi } from "@/lib/api/user";
import type {
  UserListRequestFilterRequest,
  UserListData,
  CreateUserRequest,
  UpdateUserRequest,
  RoleUI,
  StatusUI,
} from "@/types/interfaces/user";
import ConfirmDeleteDialog from "../confirm-dialog";

/* ---------------------------------------------
 * Helpers
 * --------------------------------------------- */

const ROLE_ALL = "ALL";
const STATUS_ALL = "ALL";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: RoleUI;      // "Admin" | "User"
  status: StatusUI;  // "Active" | "Inactive"
  lastLogin: string;
  created: string;
  initials: string;
  color: string;
};

function formatDate(d?: string | Date | null) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const HH = String(dt.getHours()).padStart(2, "0");
  const MM = String(dt.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}`;
}

function initialsFromNameEmail(name?: string, email?: string) {
  const src = (name || email || "U").trim();
  const parts = src.split(/\s+/);
  const first = parts[0]?.[0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function pickColor(seed: string) {
  const colors = [
    "bg-blue-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-indigo-500",
  ];
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return colors[sum % colors.length];
}

function mapUser(u: UserListData): UserRow {
  // Backend trả systemRole.role_name dạng "ADMIN" | "USER"
  const role: RoleUI = u.systemRole?.role_name === "ADMIN" ? "Admin" : "User";
  // Backend status có thể là "ACTIVE"/"INACTIVE" hoặc lowercase → normalize
  const status: StatusUI =
    String(u.status || "").toUpperCase() === "INACTIVE" ? "Inactive" : "Active";

  const initials = initialsFromNameEmail(u.name, u.email);
  const color = pickColor(u.email || u.name || "");

  return {
    id: String(u.user_id),
    name: u.name,
    email: u.email,
    role,
    status,
    lastLogin: formatDate(u.last_login),
    created: formatDate(u.created_at),
    initials,
    color,
  };
}

/* ---------------------------------------------
 * Component
 * --------------------------------------------- */

export function UsersSettings() {
  /** Access gate */
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  /** Filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleUI | typeof ROLE_ALL | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusUI | typeof STATUS_ALL | "">("");

  /** Modals */
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  /** Delete dialog */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);

  /** Paging */
  const pageSize = 6;
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /** Data */
  const [loading, setLoading] = useState(false);
  const [userRows, setUserRows] = useState<UserRow[]>([]);

  /* -------- Access Check (Admins only) -------- */
  useEffect(() => {
    (async () => {
      try {
        const me = await UsersApi.me();
        if (me?.systemRole?.role_name !== "ADMIN") {
          setAccessDenied(true);
        }
      } catch (e) {
        setAccessDenied(true);
        console.error("Failed to fetch /me:", e);
      } finally {
        setAccessLoading(false);
      }
    })();
  }, []);

  /* -------- Build query from filters/paging -------- */
  const buildQuery = (): UserListRequestFilterRequest => ({
    pageIndex,
    pageSize,
    search: searchQuery || undefined,
    role: roleFilter === ROLE_ALL || roleFilter === "" ? undefined : (roleFilter as RoleUI),
    status:
      statusFilter === STATUS_ALL || statusFilter === ""
        ? undefined
        : (statusFilter as StatusUI),
  });

  /* -------- Fetch users -------- */
  const fetchUsers = async (overridePageIndex?: number) => {
    setLoading(true);
    try {
      const query = buildQuery();
      if (overridePageIndex) query.pageIndex = overridePageIndex;
      const res = await UsersApi.getAll(query);
      setTotalPages(res.totalPages || 1);
      setUserRows(res.data.map(mapUser));
    } catch (e) {
      console.error("Fetch users failed:", e);
      setUserRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessLoading && !accessDenied) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, accessLoading, accessDenied]);

  const onClickSearch = async () => {
    setPageIndex(1);
    if (!accessDenied) await fetchUsers(1);
  };

  /* -------- CRUD -------- */
  const handleCreateUser = async (payload: CreateUserRequest) => {
    try {
      await UsersApi.create(payload);
      setOpenAdd(false);
      await fetchUsers(1);
    } catch (e) {
      console.error("Create user failed:", e);
    }
  };

  const handleUpdateUser = async (payload: UpdateUserRequest) => {
    try {
      if (!selectedUser?.id) return;
      await UsersApi.update(Number(selectedUser.id), payload);
      setOpenEdit(false);
      setSelectedUser(null);
      await fetchUsers(pageIndex);
    } catch (e) {
      console.error("Update user failed:", e);
    }
  };

  const requestDelete = (user: UserRow) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await UsersApi.remove(Number(userToDelete.id));
      // nếu xoá ở trang cuối mà trang hiện tại chỉ còn 1 item → lùi 1 trang
      if (userRows.length === 1 && pageIndex > 1) {
        setPageIndex((p) => p - 1);
      } else {
        await fetchUsers(pageIndex);
      }
    } catch (e) {
      console.error("Remove user failed:", e);
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  /* -------- Paging helpers -------- */
  const goFirst = () => setPageIndex(1);
  const goPrev = () => setPageIndex((p) => Math.max(1, p - 1));
  const goNext = () => setPageIndex((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPageIndex(totalPages);

  /* -------- Gates -------- */
  if (accessLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Checking permission...
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Không được truy cập vào tài nguyên này
        </h3>
        <p className="text-sm text-gray-600 max-w-md">
          Tính năng này chỉ dành cho người dùng có quyền <b>ADMIN</b>. Vui lòng
          liên hệ quản trị viên để được cấp quyền.
        </p>
      </div>
    );
  }

  /* -------- Render -------- */
  return (
    <div className="space-y-6">
      {/* Title + Search/Filters */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Synapse User List</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Role filter */}
          <Select
            value={roleFilter || ""}
            onValueChange={(v) =>
              setRoleFilter(v as RoleUI | typeof ROLE_ALL | "")
            }
          >
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ROLE_ALL}>All roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={statusFilter || ""}
            onValueChange={(v) =>
              setStatusFilter(v as StatusUI | typeof STATUS_ALL | "")
            }
          >
            <SelectTrigger className="w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_ALL}>All status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-black hover:bg-black/80 text-white"
            onClick={onClickSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>

          <div className="flex items-center justify-end">
            <Button
              className="bg-black hover:bg-black/80 text-white"
              onClick={() => setOpenAdd(true)}
            >
              <UserPlus className="w-4 h-4 mr-2 text-white" />
              Add New User
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Last Login
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : userRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No data
                </td>
              </tr>
            ) : (
              userRows.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white font-medium text-xs`}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${user.role === "Admin"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-indigo-50 text-indigo-700 ring-indigo-200"
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${user.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-zinc-100 text-zinc-700 ring-zinc-200"
                        }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">{user.lastLogin}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.created}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors rounded p-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={6}
                        className="w-44 min-w-0 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5"
                      >
                        <DropdownMenuLabel className="px-3 py-1.5 text-sm font-semibold text-black-500">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenEdit(true);
                          }}
                          className="h-9 flex items-center px-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                        >
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="h-9 flex items-center px-3 rounded-md text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                          onClick={() => requestDelete(user)}
                        >
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={goFirst}
          disabled={pageIndex === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goPrev}
          disabled={pageIndex === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setPageIndex(page)}
            className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${pageIndex === page
              ? "bg-black text-white"
              : "text-gray-900 hover:bg-gray-200/70"
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={goNext}
          disabled={pageIndex === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={goLast}
          disabled={pageIndex === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modals */}
      <AddUserModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        open={openEdit}
        onOpenChange={(v) => {
          setOpenEdit(v);
          if (!v) setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleUpdateUser}
      />

      {/* Confirm Delete */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Warning"
        description={
          userToDelete
            ? `Bạn có chắc muốn xóa người dùng "${userToDelete.name}"? Hành động này không thể hoàn tác.`
            : "Do you really want to delete this person? This action cannot be undone."
        }
        cancelText="Cancel"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

export default UsersSettings;
