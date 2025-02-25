import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/user-list/user-list.component').then(m => m.UserListComponent),
  },
  {
    path:'agregar',
    loadComponent: () => import('./features/user-add/user-add.component').then(m => m.UserAddComponent),
  },
  {
    path:':id',
    loadComponent: () => import('./features/user-detail/user-detail.component').then(m => m.UserDetailComponent),
  },
  {
    path:'editar/:id',
    loadComponent: () => import('./features/user-edit/user-edit.component').then(m => m.UserEditComponent),
  }
];
