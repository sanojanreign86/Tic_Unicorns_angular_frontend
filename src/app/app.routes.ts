import { Routes } from '@angular/router';

import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  ...authRoutes,

  {
    path: 'gym',
    loadChildren: () =>
      import('./features/gym/gym.routes')
        .then(m => m.GYM_ROUTES)
  },
  {
    path: 'leave',
    loadChildren: () =>
      import('./features/leave/leave.routes')
        .then(m => m.LEAVE_ROUTES)
  },

  {
    path: 'certificates',
    loadComponent: () =>
      import('./features/certificates/pages/certificate-list/certificate-list')
        .then(m => m.CertificateList)
  },

  {
    path: 'certificates/request',
    loadComponent: () =>
      import('./features/certificates/pages/certificate-request/certificate-request')
        .then(m => m.CertificateRequest)
  },

  {
    path: 'certificates/:id/edit',
    loadComponent: () =>
      import('./features/certificates/pages/certificate-edit/certificate-edit')
        .then(m => m.CertificateEdit)
  },

  {
    path: 'certificates/:id',
    loadComponent: () =>
      import('./features/certificates/pages/certificate-details/certificate-details')
        .then(m => m.CertificateDetails)
  },
  ...authRoutes

  {
    path: 'identity',
    loadChildren: () =>
      import('./features/identity/identity.routes')
        .then(m => m.IDENTITY_ROUTES)
  },

  {
    path: 'students',
    loadChildren: () =>
      import('./features/students/students.routes')
        .then(m => m.studentRoutes)
  }
];