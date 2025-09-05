import { Routes } from '@angular/router';

export const PrecioPaqueteriaRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/precio-paqueteria-list/precio-paqueteria-list.component').then(m => m.PrecioPaqueteriaListComponent),
  },
  {
    path:'editar/:id',
    loadComponent: () => import('./features/precio-paqueteria-edit/precio-paqueteria-edit.component').then(m => m.PrecioPaqueteriaEditComponent),
  },
];
