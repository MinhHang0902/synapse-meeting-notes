import { LargeNumberLike } from "crypto";
import { DefaultListResponse } from "./common";

//GET: /projects
export interface ProjectListFilterRequest {
    search?: string;
    status?: string;
}

export interface ProjectListResponse extends DefaultListResponse {
    data: ProjectListData[]
}

export interface ProjectListData {
    project_id: number;
    project_name: string;
    project_description: string;
    project_status: string;
    project_members_length: number;
    project_minutes_length: number;
    project_owner: string;
    project_last_updated: Date;
}

//POST: /projects
export interface CreateProjectRequest {
    name: string;
    description: string;
    status: string;
    managers?: string;
    reviewers?: string;
    viewers?: string;
}

export interface CreateProjectResponse {
    project: {
        project_id: number;
        project_name: string;
        description: string;
        status: string;
        created_by: number;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date;
        members: MemberProjectData[];
    }
    insertedCount: number;
    roles: {
        managers: number;
        reviewers: number;
        viewers: number;
    }
}

export interface MemberProjectData {
    user: {
        user_id: number;
        name: string;
        email: string;
    }
    projectRole: {
        project_role_id: number;
        role_type: string;
    }
}

//GET: projects/{projectId}
export interface ProjectDetailResponse {
    project_id: number;
    project_name: string;
    description: string;
    project_createdAt: Date;
    project_updateddAt: Date;
    project_status: string;
    project_RecentActivities: [];
    project_minutes: [];
    project_membersAndRoles: MemberProjectData[];
}

//PATCH: projects/{projectId}
export interface UpdateProjectRequest {
    name: string;
    description: string;
    status: string;
}

export interface UpdateProjectResponse {
    project_id: number;
    project_name: string;
    description: string;
    status: string;
    created_by: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

//DELETE: projects/{projectId} 
export interface DeleteProjectResponse {
    project_id: number;
    project_name: string;
    deleted_at: Date;
    deleteMembersCount: number;
}

//POST: projects/add-member/{projectId} 
export interface AddMemberRequest {
    email: string;
    role: string;
}

export interface AddMemberResponse {
    id: number;
    project_id: number;
    user_id: number;
    project_role_id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    user: {
        user_id: number;
        name: string;
    }
    projectRole: {
        role_type: string;
    }
}

//PATCH: projects/updated-member/{projectId} 
export interface UpdateMemberRequest {
    email: string;
    role: string;
}

export interface UpdateMemberResponse {
    id: number;
    project_id: number;
    user_id: number;
    project_role_id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    user: {
        user_id: number;
        name: string;
    }
    projectRole: {
        role_type: string;
    }
}

//DELETE projects/delete-member/{projectId}/{memberId} 
export interface DeleteMemberResponse {
    id: number;
    project_id: number;
    user_id: number;
    project_role_id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}


//GET: projects/user-not-in-project/{projectId} NOT DONE
export interface CheckMemberNotInResponse {
    user_id: number;
    name: string;
    email: string;
}


