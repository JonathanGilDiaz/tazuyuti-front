import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { RoleService } from './data/services/role.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-18-boilerplate';

  constructor(private roleService: RoleService, private config: PrimeNGConfig, private translateService: TranslateService) {}

  ngOnInit(): void {
    // this.roleService.initializeMenuPermissions(); // Inicializa los permisos de menú al iniciar
    this.translateService.setDefaultLang('es'); // Default language: spanish

    // Apply the PrimeNG translations when the app loads
    this.translateService.get('primeng').subscribe((res) => {
      this.config.setTranslation(res);
    });
  }
}
