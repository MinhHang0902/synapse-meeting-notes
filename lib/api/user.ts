import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserInfoResponse,
  UserListRequestFilterRequest,
  UserListResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  SaveUserResponse,
  DeleteUserResponse,
} from "@/types/interfaces/user";
import { sendGet, sendPatch, sendPost, sendDelete } from "./axios"; 
export const UsersApi = {
  me: async () => {
    try {
      const response = await sendGet("/api/core/v1/users/me");
      return response.data as UserInfoResponse;
    } catch (error) {
      throw error;
    }
  },

  updatedProfile: async (data: UpdateProfileRequest) => {
    try {
      const response = await sendPatch("/api/core/v1/users/profile", data);
      return response.data as UserInfoResponse;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    try {
      const response = await sendPatch("/api/core/v1/users/change-password", data);
      return response.data as UserInfoResponse;
    } catch (error) {
      throw error;
    }
  },

  getAll: async (query?: UserListRequestFilterRequest): Promise<UserListResponse> => {
  try {
    const qs = new URLSearchParams();
    if (query?.search) qs.set("search", query.search);
    if (query?.status) qs.set("status", query.status);
    if (query?.role) qs.set("role", query.role);
    if (query?.pageIndex) qs.set("pageIndex", String(query.pageIndex));
    if (query?.pageSize) qs.set("pageSize", String(query.pageSize));
    if (query?.sortKey) qs.set("sortKey", String(query.sortKey));
    if (query?.sortOrder) qs.set("sortOrder", String(query.sortOrder));

    const url = `/api/core/v1/users${qs.toString() ? `?${qs.toString()}` : ""}`;
    const response = await sendGet(url);

    return response.data as UserListResponse;
  } catch (error) {
    throw error;
  }
},

  detail: async (userId: number): Promise<SaveUserResponse> => {
    try {
      const response = await sendGet(`/api/core/v1/users/${userId}`);
      return response.data as SaveUserResponse;
    } catch (error) {
      throw error;
    }
  },

  create: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    try {
      const response = await sendPost("/api/core/v1/users", data);
      return response.data as CreateUserResponse;
    } catch (error) {
      throw error;
    }
  },

  update: async (userId: number, data: UpdateUserRequest): Promise<SaveUserResponse> => {
    try {
      const response = await sendPatch(`/api/core/v1/users/${userId}`, data);
      return response.data as SaveUserResponse;
    } catch (error) {
      throw error;
    }
  },

  remove: async (userId: number): Promise<DeleteUserResponse> => {
    try {
      const response = await sendDelete(`/api/core/v1/users/${userId}`);
      return response.data as DeleteUserResponse;
    } catch (error) {
      throw error;
    }
  },
};
