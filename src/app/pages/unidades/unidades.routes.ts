import { Routes } from '@angular/router';

export const UnidadRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/unidades-list/unidades-list.component').then(m => m.UnidadesListComponent),
  },
  {
    path:'editar/:id',
    loadComponent: () => import('./features/unidades-edit/unidades-edit.component').then(m => m.UnidadesEditComponent),
  },
];
