import { Routes } from '@angular/router';

export const ProductosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/producto-list/producto-list.component').then(m => m.ProductoListComponent),
  },
  {
    path:'editar/:id',
    loadComponent: () => import('./features/producto-edit/producto-edit.component').then(m => m.ProductoEditComponent),
  },
  {
    path:':id',
    loadComponent: () => import('./features/producto-detail/producto-detail.component').then(m => m.ProductoDetailComponent),
  }
];
