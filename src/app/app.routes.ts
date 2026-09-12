import { Routes } from '@angular/router';

export const routes: Routes = [
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
  }
];