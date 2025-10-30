import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenubarModule } from 'primeng/menubar';
import { MenuElement } from '@app/core/interfaces/apiResponse';
import { MenuItem } from 'primeng/api';
import { ModalService } from '../modal/services/modal.service';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    FormsModule,
    CalendarModule,
    PanelMenuModule,
    MenubarModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  logoNav = 'assets/template/images/logo-blanco-2-min.png';
  logoSideBar = 'assets/template/images/logo.png';
  sidebarVisible: boolean = false;
  menu: MenuItem[] = [];
  //username: string = 'Usuario';

  constructor(
    protected authService: AuthService,
    private modalService: ModalService,
    private router: Router
  ) {
    if (this.adaptarMenuData(this.authService.getMenu() ?? [])) {
      this.menu = this.adaptarMenuData(this.authService.getMenu() ?? []);
    } else {
      this.modalService
        .openAlertModal('error', 'Error', 'Error al obtener el menú')
        .subscribe({
          next: () => {
            this.router.navigate([this.router.url]);
          },
        });
    }
  }

  /**
   *
   * @param menuData Menú obtenido desde la base de datos
   * @returns Menú adaptado para el componente menú de primeng.
   */
  adaptarMenuData(menuData: MenuElement[]): MenuItem[] {
    if (!menuData) {
      return [];
    }
    return menuData.map((menuItem) => {
      const hasSubMenus = menuItem.subMenus && menuItem.subMenus.length > 0;

      const adaptedMenu: MenuItem = {
        label: menuItem.menu.opcion.opcion,
        icon: menuItem.menu.opcion.icono || 'pi pi-fw pi-folder',
        routerLink: hasSubMenus ? null : `/${menuItem.menu.opcion.url}`, // Si no tiene submenús, debe ser un enlace directo
        items: hasSubMenus
          ? menuItem.subMenus.map((subMenu) => ({
              label: subMenu.opcion.opcion,
              icon: subMenu.opcion.icono || 'pi pi-fw pi-file',
              routerLink: subMenu.opcion.url ? `/${subMenu.opcion.url}` : null,
            }))
          : undefined, // No agregar `items` si no tiene submenús
      };

      return adaptedMenu;
    });
  }

  cerrarSesion(event: Event) {
    this.authService.logout();
  }
}
