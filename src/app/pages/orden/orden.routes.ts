import { Routes } from '@angular/router';

export const OrdenRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/orden-list/orden-list.component').then(m => m.OrdenListComponent),
  },
  {
    path:':id',
    loadComponent: () => import('./features/orden-detail/orden-detail.component').then(m => m.OrdenDetailComponent),
  }
];
