import { DefaultListQuery } from "./common";

// voi cac request, neu truong la optional, can co dau ?
export interface UserProjectMember {
    project: {
        project_id: number;
        project_name: string;
    },
    projectRole: {
        role_type: string;
    }
}

// GET: users/me (use same by UpdateProfileResponse and ChangePasswordResponse)
export interface UserInfoResponse {
    user_id: number;
    name: string;
    email: string;
    system_role_id: number;
    status: string;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    systemRole: {
        system_role_id: number;
        role_name: string;
    },
    projectMembers: UserProjectMember[];
}

// PATCH: users/profile
export interface UpdateProfileRequest {
    name: string;
}

// PATCH: users/change-password
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// GET: users
export interface UserListRequestFilterRequest extends DefaultListQuery {
    search?: string;
    status?: string;
    role?: string;
    paging: true,
}
export interface UserListResponse {
    paging: boolean;
    hasMore: boolean;
    pageIndex: number;
    totalPages: number;
    totalItems: number;
    data: UserListData[];
}

export interface UserListData {
    user_id: number;
    name: string;
    email: string;
    status: string;
    last_login: Date;
    created_at: Date;
    systemRole: {
        role_name: string;
    }
}

export interface CreateUserRequest {
    name: string;
    email: string;
    role: string;
}

export interface CreateUserResponse {
    user_id: number;
    name: string;
    email: string;
    status: string;
    systemRole: {
        role_name: string;
    }
}

export interface UpdateUserRequest {
    name: string;
    email: string;
    role: string;
    status: string;
}

// (giữ nguyên tên theo input – có typo)
export interface SaveUserRequesr {
    user_id: number;
    name: string;
    email: string;
    system_role_id: number;
    status: string;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

// DELETE: delete user/{userId}
export interface DeleteUserResponse {
    user_id: number;
    name: string;
    email: string;
    password: string;
    system_role_id: number;
    status: string;
    last_login: Date;
    created_at: Date;
    updaetd_at: Date; // giữ nguyên theo input
    deleted_at: Date;
}

// Alias tiện dùng (vì tên gốc có typo)
export type SaveUserResponse = SaveUserRequesr;

export type RoleUI = "Admin" | "User";
export type RoleAPI = "ADMIN" | "USER";

export const ROLE_TO_API: Record<RoleUI, RoleAPI> = {
    Admin: "ADMIN",
    User: "USER",
};

export const ROLE_TO_UI: Record<RoleAPI, RoleUI> = {
    ADMIN: "Admin",
    USER: "User",
};

export type StatusUI = 'Active' | 'Inactive';
export type StatusAPI = 'ACTIVE' | 'INACTIVE';

export const STATUS_TO_API: Record<StatusUI, StatusAPI> = {
    Active: "ACTIVE",
    Inactive: "INACTIVE",
};

export interface UserRow {
    id: string;
    name: string;
    email: string;
    role: RoleUI;
    status: StatusUI;
    lastLogin: string;
    created: string;
    initials: string;
    color: string;
}