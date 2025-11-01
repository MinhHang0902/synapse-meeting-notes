import { ChangePasswordRequest, UpdateProfileRequest, UserInfoResponse, UserListRequestFilterRequest, UserListResponse } from "@/types/interfaces/user";
import { sendGet, sendPatch, sendPost } from "./axios";

export const UsersApi = {
    me: async () => {
        try {
            const response = await sendGet('/api/core/v1/users/me');
            return response.data as UserInfoResponse;
        } catch (error) {
            throw error;
        }
    },

    updatedProfile: async (data: UpdateProfileRequest) => {
        try {
            const response = await sendPatch('/api/core/v1/users/profile', data);
            return response.data as UserInfoResponse;
        } catch (error) {
            throw error;
        }
    },

    changePassword: async (data: ChangePasswordRequest) => {
        try {
            const response = await sendPatch('/api/core/v1/users/change-password', data);
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
            return response;
        } catch (error) {
            throw error;
        }
    }
}