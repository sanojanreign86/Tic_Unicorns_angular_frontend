import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'complaints',
    loadComponent: () =>
      import('./features/complaints/pages/complaint-list/complaint-list.component')
        .then(m => m.ComplaintListComponent)
  }
];