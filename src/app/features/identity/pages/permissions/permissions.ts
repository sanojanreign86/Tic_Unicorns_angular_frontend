import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IdentityService } from '../../services/identity.service';
import { Permission } from '../../models/permission.model';
import { PermissionTableComponent } from '../../components/permission-table/permission-table';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    PermissionTableComponent
  ],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css'
})
export class PermissionsComponent implements OnInit {
  private readonly identityService = inject(IdentityService);

  protected permissions: Permission[] = [];
  protected isLoading = false;
  protected errorMessage = '';

  ngOnInit(): void {
    this.loadPermissions();
  }

  private loadPermissions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.identityService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error?.error?.message ||
          'Unable to load permissions. Please try again.';
      }
    });
  }

  protected retry(): void {
    this.loadPermissions();
  }
}