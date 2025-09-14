import { Routes } from '@angular/router';

export const PrecioBoletosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/pasajes-list/pasajes-list.component').then(m => m.PasajesListComponent),
  },
];
