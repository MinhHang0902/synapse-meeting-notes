export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RequestOtpRequest {
  email: string;
}

export interface RequestOtpResponse {
  ok: boolean;
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  ok: boolean;
  resetToken: string;
  expiresInSec: number;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  ok: boolean;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}