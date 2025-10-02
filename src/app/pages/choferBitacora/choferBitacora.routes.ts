import { Routes } from '@angular/router';

export const ChoferBitacoraRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/chofer-bitacora-list/chofer-bitacora-list.component').then(m => m.ChoferBitacoraListComponent),
  }
];
