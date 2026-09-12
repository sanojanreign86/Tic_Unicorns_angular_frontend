export interface Role {
  roleId: number;
  roleName: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string | null;
}

export interface UpdateRoleRequest {
  roleName: string;
  description?: string | null;
  isActive: boolean;
}

export interface RolePermission {
  rolePermissionId: number;
  roleId: number;
  permissionId: number;
}