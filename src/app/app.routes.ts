import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { PortalDashboardComponent } from './portal/dashboard/portal-dashboard';
import { ModuleWorkspaceComponent } from './portal/module-workspace/module-workspace';
import { AccountSecurityComponent } from './portal/account-security/account-security';

const both = ['Admin', 'Student'];
const admin = ['Admin'];

export const routes: Routes = [
  ...authRoutes,
  {
    path: 'portal',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: PortalDashboardComponent },
      { path: 'account-security', component: AccountSecurityComponent },
      { path: 'events', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'events', roles: both } },
      { path: 'labs', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'labs', roles: both } },
      { path: 'hostels', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'hostels', roles: both } },
      { path: 'canteen', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'canteen', roles: both } },
      { path: 'certificates', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'certificates', roles: both } },
      { path: 'complaints', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'complaints', roles: both } },
      { path: 'fees', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'fees', roles: both } },
      { path: 'gym', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'gym', roles: both } },
      { path: 'leave', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'leave', roles: both } },
      { path: 'sports', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'sports', roles: both } },
      { path: 'notifications', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'notifications', roles: both } },
      { path: 'students', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'students', roles: admin } },
      { path: 'academic', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'academic', roles: admin } },
      { path: 'identity', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'identity', roles: admin } },
      { path: 'system-settings', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'system-settings', roles: admin } },
      { path: 'audit-logs', component: ModuleWorkspaceComponent, canActivate: [roleGuard], data: { moduleKey: 'audit-logs', roles: admin } },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'portal/dashboard' },
  { path: '**', redirectTo: 'portal/dashboard' }
];
