import { Routes } from '@angular/router';

import { RegistrationComponent } from './registration/registration';
import { PasswordSetupComponent } from './password-setup/password-setup';

import { StudentList } from './pages/student-list/student-list';
import { StudentDetails } from './pages/student-details/student-details';
import { StudentCreate } from './pages/student-create/student-create';
import { MasterList } from './pages/master-list/master-list';
import { MasterListCreate } from './pages/master-list-create/master-list-create';
import { MasterListEdit } from './pages/master-list-edit/master-list-edit';

export const studentRoutes: Routes = [
  {
    path: '',
    component: StudentList
  },
  {
    path: 'registration',
    component: RegistrationComponent
  },
  {
    path: 'password-setup',
    component: PasswordSetupComponent
  },
  {
    path: 'master-list',
    component: MasterList
  },
  {
    path: 'create',
    component: StudentCreate
  },
  {
    path: ':id',
    component: StudentDetails
  },
 {
  path: 'master-list/create',
  component: MasterListCreate
},
{
  path: 'master-list/:id/edit',
  component: MasterListEdit
},
{
  path: 'master-list',
  component: MasterList
},
  
];