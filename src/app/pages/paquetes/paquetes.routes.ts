import { Routes } from '@angular/router';

export const PaquetesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/paquetes-list/paquetes-list.component').then(m => m.PaquetesListComponent),
  },
  {
    path:':id',
    loadComponent: () => import('./features/paquetes-detail/paquetes-detail.component').then(m => m.PaquetesDetailComponent),
  }
];
