import { Routes } from '@angular/router';
import { PrimengComponent } from './primeng/primeng.component';
import { authGuard } from './core/guards/auth.guard';
import { MODULES_URLS } from './constants/app.constants';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  // rutas publicas
  {
    path: 'auth',
    // canActivate: [publicGuard],
    loadChildren: () => import('@app/pages/auth/auth.routes'),
  },
  {
    path: '',
    
    children: [
      {
        path: 'primeng',
        loadComponent: () => PrimengComponent,
      },
      {
        path: 'usuarios',
        loadChildren: () => import('@app/pages/users/user.routes').then(m => m.userRoutes),
      },
      {
        path: 'dashboard',
        loadComponent: () => DashboardComponent,
      },
      {
        path: '**',
        redirectTo: MODULES_URLS.PUBLIC.DEFAULT
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'main',
  },
];
