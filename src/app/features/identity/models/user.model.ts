export interface User {
  userId: number;
  username: string;
  email: string | null;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface UserRole {
  userRoleId: number;
  userId: number;
  roleId: number;
  assignedAt: string;
}