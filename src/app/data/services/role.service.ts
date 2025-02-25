import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private menuPermissions: string[] = [];
  private initialized = false;

  constructor(private authService: AuthService) {}

  initializeMenuPermissions(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const menus = this.authService.getMenu();
        if (menus) {
          this.setMenuPermissions(menus);
        }
        this.initialized = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  setMenuPermissions(menus: any[]): void {
    this.menuPermissions = [];
    this.extractUrls(menus);
  }

  private extractUrls(menus: any[]): void {
    menus.forEach(menu => {
      if (menu.menu?.opcion?.url) {
        this.menuPermissions.push(this.normalizeUrl(menu.menu.opcion.url));
      }

      if (menu.subMenus?.length) {
        menu.subMenus?.forEach((subMenu: any) => {
          if (subMenu.opcion?.url) {
            this.menuPermissions.push(this.normalizeUrl(subMenu.opcion.url));
          }
        });
      }
    });
  }

  private normalizeUrl(url: string): string {
    return url.startsWith('/') ? url : `/${url}`;
  }

  hasAccess(url: string): boolean {

    const normalizedUrl = this.normalizeUrl(url);

    // Verificar si la URL exacta está en los permisos
    if (this.menuPermissions.includes(normalizedUrl)) {
      return true;
    }

    // Verificar si alguna ruta base en los permisos es un prefijo de la URL actual
    return this.menuPermissions.some(permittedUrl => {
      // Asegurarse de que la coincidencia sea al inicio de un segmento de ruta
      if (normalizedUrl.startsWith(permittedUrl)) {
        // Verificar si la URL termina exactamente en la ruta permitida
        if (normalizedUrl === permittedUrl) {
          return true;
        }

        // Verificar si después de la ruta permitida viene un '/'
        const remainingPath = normalizedUrl.substring(permittedUrl.length);
        return remainingPath.startsWith('/');
      }
      return false;
    });
  }
}
