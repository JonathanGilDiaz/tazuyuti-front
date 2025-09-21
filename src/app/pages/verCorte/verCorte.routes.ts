import { Routes } from '@angular/router';

export const verCorteRoutes: Routes = [
  {
    path:'',
    loadComponent: () => import('./features/ver-corte-list/ver-corte-list.component').then(m => m.VerCorteListComponent),
  }
  
];
