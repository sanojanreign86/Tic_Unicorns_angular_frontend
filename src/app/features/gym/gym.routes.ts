import { Routes } from '@angular/router';

import { GymList } from './pages/gym-list/gym-list';
import { GymForm } from './pages/gym-form/gym-form';
import { GymDetails } from './pages/gym-details/gym-details';

export const GYM_ROUTES: Routes = [
  {
    path: '',
    component: GymList
  },
  {
    path: 'create',
    component: GymForm
  },
  {
    path: 'edit/:gymId',
    component: GymForm
  },
  {
    path: ':gymId',
    component: GymDetails
  }
];