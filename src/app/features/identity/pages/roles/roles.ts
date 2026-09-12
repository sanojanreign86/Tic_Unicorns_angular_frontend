import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IdentityService } from '../../services/identity.service';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../../models/role.model';
import { RoleTableComponent } from '../../components/role-table/role-table';
import { RoleFormComponent } from '../../components/role-form/role-form';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    RoleTableComponent,
    RoleFormComponent
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class RolesComponent implements OnInit {
  private readonly identityService = inject(IdentityService);

  protected roles: Role[] = [];
  protected isLoading = false;
  protected isSaving = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected showForm = false;
  protected selectedRole: Role | null = null;

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.identityService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error?.error?.message ||
          'Unable to load roles. Please try again.';
      }
    });
  }

  protected openCreateForm(): void {
    this.selectedRole = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.showForm = true;
  }

  protected openEditForm(role: Role): void {
    this.selectedRole = role;
    this.successMessage = '';
    this.errorMessage = '';
    this.showForm = true;
  }

  protected closeForm(): void {
    if (this.isSaving) {
      return;
    }

    this.showForm = false;
    this.selectedRole = null;
  }

  protected saveRole(
    request: CreateRoleRequest | UpdateRoleRequest
  ): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.selectedRole) {
      this.updateRole(
        this.selectedRole.roleId,
        request as UpdateRoleRequest
      );
      return;
    }

    this.createRole(request as CreateRoleRequest);
  }

  private createRole(request: CreateRoleRequest): void {
    this.identityService.createRole(request).subscribe({
      next: (role) => {
        this.roles = [...this.roles, role];
        this.isSaving = false;
        this.showForm = false;
        this.selectedRole = null;
        this.successMessage = 'Role created successfully.';
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage =
          error?.error?.message ||
          'Unable to create role. Please try again.';
      }
    });
  }

  private updateRole(
    roleId: number,
    request: UpdateRoleRequest
  ): void {
    this.identityService.updateRole(roleId, request).subscribe({
      next: (updatedRole) => {
        this.roles = this.roles.map((role) =>
          role.roleId === updatedRole.roleId
            ? updatedRole
            : role
        );

        this.isSaving = false;
        this.showForm = false;
        this.selectedRole = null;
        this.successMessage = 'Role updated successfully.';
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage =
          error?.error?.message ||
          'Unable to update role. Please try again.';
      }
    });
  }

  protected retry(): void {
    this.loadRoles();
  }
}