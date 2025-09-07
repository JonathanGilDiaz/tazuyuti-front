import { Routes } from '@angular/router';

export const RutasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/rutas-list/rutas-list.component').then(m => m.RutasListComponent),
  },
  {
    path:'editar/:id',
    loadComponent: () => import('./features/rutas-edit/rutas-edit.component').then(m => m.RutasEditComponent),
  },
];
