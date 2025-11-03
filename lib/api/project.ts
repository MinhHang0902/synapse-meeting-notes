// '@/lib/auth/project.ts'
import { sendGet, sendPost, sendPatch, sendDelete } from "@/lib/api/axios";
import type {
  ProjectListFilterRequest,
  ProjectListResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectDetailResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  DeleteProjectResponse,
  AddMemberRequest,
  AddMemberResponse,
  UpdateMemberRequest,
  UpdateMemberResponse,
  DeleteMemberResponse,
  CheckMemberNotInResponse,
} from "@/types/interfaces/project";

const BASE = "/api/core/v1/projects";

export const ProjectsApi = {
  list: async (
    query?: ProjectListFilterRequest & {
      pageIndex?: number;
      pageSize?: number;
      sortKey?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ProjectListResponse> => {
    const qs = new URLSearchParams();
    if (query?.search) qs.set("search", query.search);
    if (query?.status) qs.set("status", query.status);
    if (query?.pageIndex) qs.set("pageIndex", String(query.pageIndex));
    if (query?.pageSize) qs.set("pageSize", String(query.pageSize));
    if (query?.sortKey) qs.set("sortKey", String(query.sortKey));
    if (query?.sortOrder) qs.set("sortOrder", String(query.sortOrder));

    const url = `${BASE}${qs.toString() ? `?${qs.toString()}` : ""}`;
    const response = await sendGet(url);
    return response.data as ProjectListResponse;
  },

  create: async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
    const response = await sendPost(`${BASE}`, data);
    return response.data as CreateProjectResponse;
  },

  detail: async (projectId: number): Promise<ProjectDetailResponse> => {
    const response = await sendGet(`${BASE}/${projectId}`);
    return response.data as ProjectDetailResponse;
  },

  update: async (
    projectId: number,
    data: UpdateProjectRequest
  ): Promise<UpdateProjectResponse> => {
    const response = await sendPatch(`${BASE}/${projectId}`, data);
    return response.data as UpdateProjectResponse;
  },

  remove: async (projectId: number): Promise<DeleteProjectResponse> => {
    const response = await sendDelete(`${BASE}/${projectId}`);
    return response.data as DeleteProjectResponse;
  },

  addMember: async (
    projectId: number,
    data: AddMemberRequest
  ): Promise<AddMemberResponse> => {
    const response = await sendPost(`${BASE}/add-member/${projectId}`, data);
    return response.data as AddMemberResponse;
  },

  updateMember: async (
    projectId: number,
    data: UpdateMemberRequest
  ): Promise<UpdateMemberResponse> => {
    const response = await sendPatch(`${BASE}/updated-member/${projectId}`, data);
    return response.data as UpdateMemberResponse;
  },

  deleteMember: async (
    projectId: number,
    memberId: number
  ): Promise<DeleteMemberResponse> => {
    const response = await sendDelete(`${BASE}/delete-member/${projectId}/${memberId}`);
    return response.data as DeleteMemberResponse;
  },

  usersNotInProject: async (
    projectId: number,
    search?: string
  ): Promise<CheckMemberNotInResponse[]> => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    const url = `${BASE}/user-not-in-project/${projectId}${qs.toString() ? `?${qs.toString()}` : ""}`;
    const response = await sendGet(url);
    return response.data as CheckMemberNotInResponse[];
  },
};
