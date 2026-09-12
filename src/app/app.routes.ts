import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'gym',
    loadChildren: () =>
      import('./features/gym/gym.routes')
        .then(m => m.GYM_ROUTES)
  }
];