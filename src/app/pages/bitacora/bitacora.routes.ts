import { Routes } from '@angular/router';

export const BitacoraRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/bitacora-list/bitacora-list.component').then(m => m.BitacoraListComponent),
  },
  {
    path:':id',
    loadComponent: () => import('./features/bitacora-detail/bitacora-detail.component').then(m => m.BitacoraDetailComponent),
  }
];
