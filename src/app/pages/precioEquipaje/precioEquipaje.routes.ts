import { Routes } from '@angular/router';

export const PrecioEquipajeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/precio-equipaje-list/precio-equipaje-list.component').then(m => m.PrecioEquipajeListComponent),
  },
  {
    path:'editar/:id',
    loadComponent: () => import('./features/precio-equipaje-edit/precio-equipaje-edit.component').then(m => m.PrecioEquipajeEditComponent),
  },
];
