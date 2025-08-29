import { Routes } from '@angular/router';

export const ClienteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/cliente-list/cliente-list.component').then(m => m.ClienteListComponent),
  },
  {
    path:'editar/:id',
    loadComponent: () => import('./features/cliente-edit/cliente-edit.component').then(m => m.ClienteEditComponent),
  },
  {
    path:':id',
    loadComponent: () => import('./features/cliente-detail/cliente-detail.component').then(m => m.ClienteDetailComponent),
  }
];
