import { Routes } from '@angular/router';

import { LeaveList } from './pages/leave-list/leave-list';
import { LeaveForm } from './pages/leave-form/leave-form';
import { LeaveDetails } from './pages/leave-details/leave-details';

export const LEAVE_ROUTES: Routes = [
  {
    path: '',
    component: LeaveList
  },
  {
    path: 'create',
    component: LeaveForm
  },
  {
    path: 'edit/:leaveId',
    component: LeaveForm
  },
  {
    path: ':leaveId',
    component: LeaveDetails
  }
];