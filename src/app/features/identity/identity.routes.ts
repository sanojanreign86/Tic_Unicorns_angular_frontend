import { Routes } from '@angular/router';

export const IDENTITY_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users')
        .then(m => m.UsersComponent)
  },

  {
    path: 'roles',
    loadComponent: () =>
      import('./pages/roles/roles')
        .then(m => m.RolesComponent)
  },

  {
    path: 'permissions',
    loadComponent: () =>
      import('./pages/permissions/permissions')
        .then(m => m.PermissionsComponent)
  },

  {
    path: 'staff-assignment',
    loadComponent: () =>
      import('./pages/staff-assignment/staff-assignment')
        .then(m => m.StaffAssignmentComponent)
  }
];