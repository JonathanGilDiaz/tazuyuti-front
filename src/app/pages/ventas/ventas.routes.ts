import { Routes } from '@angular/router';

export const VentasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/ventas-list/ventas-list.component').then(m => m.VentasListComponent),
  },
  {
    path:':id',
    loadComponent: () => import('./features/ventas-detail/ventas-detail.component').then(m => m.VentasDetailComponent),
  }
];
