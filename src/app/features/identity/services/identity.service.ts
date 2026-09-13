import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

import {
  User,
  UserRole
} from '../models/user.model';

import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RolePermission
} from '../models/role.model';

import { Permission } from '../models/permission.model';
import { StaffAssignment } from '../models/staff-assignment.model';
import { AuditLog } from '../../audit-logs/models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private readonly api = inject(ApiService);

  // -------------------------
  // Users
  // -------------------------

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('Identity/users');
  }

  getUserById(userId: number): Observable<User> {
    return this.api.get<User>(`Identity/users/${userId}`);
  }

  // -------------------------
  // Roles
  // -------------------------

  getRoles(): Observable<Role[]> {
    return this.api.get<Role[]>('Identity/roles');
  }

  getRoleById(roleId: number): Observable<Role> {
    return this.api.get<Role>(`Identity/roles/${roleId}`);
  }

  createRole(request: CreateRoleRequest): Observable<Role> {
    return this.api.post<Role>('Identity/roles', request);
  }

  updateRole(
    roleId: number,
    request: UpdateRoleRequest
  ): Observable<Role> {
    return this.api.put<Role>(
      `Identity/roles/${roleId}`,
      request
    );
  }

  // -------------------------
  // Permissions
  // -------------------------

  getPermissions(): Observable<Permission[]> {
    return this.api.get<Permission[]>('Identity/permissions');
  }

  // -------------------------
  // User Roles
  // -------------------------

  assignRoleToUser(
    userId: number,
    roleId: number
  ): Observable<UserRole> {
    return this.api.post<UserRole>(
      `Identity/users/${userId}/roles/${roleId}`,
      {}
    );
  }

  // -------------------------
  // Role Permissions
  // -------------------------

  assignPermissionToRole(
    roleId: number,
    permissionId: number
  ): Observable<RolePermission> {
    return this.api.post<RolePermission>(
      `Identity/roles/${roleId}/permissions/${permissionId}`,
      {}
    );
  }

  // -------------------------
  // Staff Assignments
  // -------------------------

  assignStaffScope(
    request: StaffAssignment
  ): Observable<StaffAssignment> {
    return this.api.post<StaffAssignment>(
      'Identity/staff-assignments',
      request
    );
  }

  // -------------------------
  // Audit Logs
  // -------------------------

  getAuditLogs(): Observable<AuditLog[]> {
    return this.api.get<AuditLog[]>('Identity/audit-logs');
  }
}