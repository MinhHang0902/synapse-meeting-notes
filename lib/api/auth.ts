import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, RequestOtpRequest, RequestOtpResponse, ResetPasswordRequest, ResetPasswordResponse, VerifyOtpRequest, VerifyOtpResponse } from "@/types/interfaces/auth";
import { sendPost } from "./axios";

export const AuthApi = {
  signIn: async (data: LoginRequest) => {
    try {
      const response = await sendPost('/api/core/v1/auth/login', data);
      return response.data as LoginResponse;
    } catch (error) {
      throw error;
    }
  },

  requestOtp: async (data: RequestOtpRequest) => {
    try {
      const response = await sendPost('/api/core/v1/auth/request-otp', data);
      return response.data as RequestOtpResponse;
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    try {
      const response = await sendPost('/api/core/v1/auth/verify-otp', data);
      return response.data as VerifyOtpResponse;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const response = await sendPost('/api/core/v1/auth/reset-password', data);
      return response.data as ResetPasswordResponse;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    try {
      const response = await sendPost('/api/core/v1/auth/refresh', data);
      return response.data as RefreshTokenResponse;
    } catch (error) {
      throw error;
    }
  },
}