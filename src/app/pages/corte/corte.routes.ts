import { Routes } from '@angular/router';

export const PaquetesRoutes: Routes = [
  {
    path:'',
    loadComponent: () => import('./features/corte-detail/corte-detail.component').then(m => m.CorteDetailComponent),
  }
  
];
