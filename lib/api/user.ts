import { ChangePasswordRequest, UpdateProfileRequest, UserInfoResponse } from "@/types/interfaces/user";
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
}