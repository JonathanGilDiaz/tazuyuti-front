import { Routes } from '@angular/router';

export const TaquillaRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/taquilla-list/taquilla-list.component').then(m => m.TaquillaListComponent),
  },
];
