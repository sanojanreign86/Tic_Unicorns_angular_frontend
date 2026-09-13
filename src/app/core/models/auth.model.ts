export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  username: string;
  role: 'Admin' | 'Student' | string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  mustChangePassword: boolean;
  isPhoneVerified: boolean;
}

export interface CurrentUser {
  userId: number;
  username: string;
  role: 'Admin' | 'Student' | string;
}
