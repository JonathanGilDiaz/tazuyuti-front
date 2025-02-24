import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrimeNGModules } from '../primeng-config';
import { LayoutComponent } from '../shared/ui/layout/layout.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-primeng',
  standalone: true,
  imports:[
    PrimeNGModules,
    LayoutComponent,
    CalendarModule,
    FormsModule,
    TabViewModule, BadgeModule, AvatarModule //Ocupados en Tabla
  ],
  templateUrl: './primeng.component.html',
  styleUrl: './primeng.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrimengComponent {
  //Imágenes
  logoMenu = 'assets/template/images/logo-blanco-2-min.png';
  logoVertical = 'assets/template/images/logo-vertical-2.png';
  icono_registrado = 'assets/template/images/iconos/icono_registrado.png';
  icono_turnado = 'assets/template/images/iconos/icono_turnado.png';
  icono_recibido = 'assets/template/images/iconos/icono_recibido.png';
  icono_seguimiento = 'assets/template/images/iconos/icono_seguimiento.png';
  icono_concluido = 'assets/template/images/iconos/icono_concluido.png';
  icono_consultas_reporte = 'assets/template/images/iconos/icono_consultas_reporte.png';
  icono_seguimiento_peticion = 'assets/template/images/iconos/icono_seguimiento_peticion.png';
  icono_turnado_peticion = 'assets/template/images/iconos/icono_turnado_peticion.png';
  icono_registro_solicitud = 'assets/template/images/iconos/icono_registro_solicitud.png';
  icono_inicio = 'assets/template/images/iconos/icono_inicio.png';

  date: Date;

  //Mensajes
  messages: Message[] = [];

    ngOnInit() {
        this.messages = [
            { severity: 'info', detail: 'Info Message' },
            { severity: 'success', detail: 'Success Message' },
            { severity: 'warn', detail: 'Warning Message' },
            { severity: 'error', detail: 'Error Message' },
            { severity: 'secondary', detail: 'Secondary Message' },
            { severity: 'contrast', detail: 'Contrast Message' }
        ];
    }

  constructor() {
    this.date = new Date(); // Inicializamos la fecha con la fecha actual
  }
}
