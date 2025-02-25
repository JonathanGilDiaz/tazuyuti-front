import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { RoleService } from '@app/data/services/role.service';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MODULES_URLS } from '@app/constants/app.constants';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  // Si el usuario no está autenticado, redirigir al login
  if (!authService.isAuthenticated()) {
    router.navigate(['/main']);
    return of(false);
  }

  // Obtener la URL actual sin parámetros
  const requestedUrl = state.url.split('?')[0];

  // Convertir la promesa a observable y manejar el flujo
  return from(roleService.initializeMenuPermissions()).pipe(
    map(() => {
      // Si es la ruta default, permitir acceso
      if (requestedUrl === MODULES_URLS.PUBLIC.DEFAULT) {
        return true;
      }

      const hasAccess = roleService.hasAccess(requestedUrl);

      if (!hasAccess) {
        console.warn(`Acceso denegado a: ${requestedUrl}`);
        router.navigate([MODULES_URLS.PUBLIC.DEFAULT]);
        return false;
      }

      return true;
    }),
    catchError((error) => {
      console.error('Error en el guard:', error);
      router.navigate([MODULES_URLS.PUBLIC.DEFAULT]);
      return of(false);
    })
  );
};
