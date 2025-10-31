export interface UserProjectMember {
    project: {
        project_id: number;
        project_name: string;
    },
    projectRole: {
        role_type: string;
    }
}

export interface UserInfoResponse {
    user_id: string;
    email: string;
    name: string;
    phone: string;
    status: string;
    systemRole: {
        system_role_id: number;
        role_name: string;
    },
    projectMembers: UserProjectMember[]
}

export interface UpdateProfileRequest {
    name: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}