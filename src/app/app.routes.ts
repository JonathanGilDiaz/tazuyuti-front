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
        path: 'inventario',
        loadChildren: () => import('@app/pages/productos/productos.routes').then(m => m.ProductosRoutes),
      },
       {
        path: 'ventas',
        loadChildren: () => import('@app/pages/ventas/ventas.routes').then(m => m.VentasRoutes),
      },
       {
        path: 'precioPaqueteria',
        loadChildren: () => import('@app/pages/precioPaqueteria/precioPaqueteria.routes').then(m => m.PrecioPaqueteriaRoutes),
      },
       {
        path: 'equipaje',
        loadChildren: () => import('@app/pages/precioEquipaje/precioEquipaje.routes').then(m => m.PrecioEquipajeRoutes),
      },
       {
        path: 'clientes',
        loadChildren: () => import('@app/pages/clientes/clientes.routes').then(m => m.ClienteRoutes),
      },
      {
        path: 'pasajes',
        loadChildren: () => import('@app/pages/pasajes/precioBoletos.routes').then(m => m.PrecioBoletosRoutes),
      },
      {
        path: 'bitacora',
        loadChildren: () => import('@app/pages/bitacora/bitacora.routes').then(m => m.BitacoraRoutes),
      },
      {
        path: 'taquilla',
        loadChildren: () => import('@app/pages/taquilla/taquilla.routes').then(m => m.TaquillaRoutes),
      },
       {
        path: 'orden',
        loadChildren: () => import('@app/pages/orden/orden.routes').then(m => m.OrdenRoutes),
      },
       {
        path: 'paquetes',
        loadChildren: () => import('@app/pages/paquetes/paquetes.routes').then(m => m.PaquetesRoutes),
      },
      {
        path: 'bitacoraOperador',
        loadChildren: () => import('@app/pages/choferBitacora/choferBitacora.routes').then(m => m.ChoferBitacoraRoutes),
      },
      {
        path: 'corte',
        loadChildren: () => import('@app/pages/corte/corte.routes').then(m => m.PaquetesRoutes),
      },
        {
        path: 'verCorte',
        loadChildren: () => import('@app/pages/verCorte/verCorte.routes').then(m => m.verCorteRoutes),
      },
       {
        path: 'unidades',
        loadChildren: () => import('@app/pages/unidades/unidades.routes').then(m => m.UnidadRoutes),
      },
        {
        path: 'horarios',
        loadChildren: () => import('@app/pages/rutas/rutas.routes').then(m => m.RutasRoutes),
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
