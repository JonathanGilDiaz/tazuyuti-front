import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { ProductosService } from '@app/data/services/productos.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClienteService } from '@app/data/services/clientes.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './cliente-detail.component.html',
  styleUrl: './cliente-detail.component.css',
})
export class ClienteDetailComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: ClienteService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {
    this.iniciarFormulario();

    // Si viene el producto completo:
    if (this.config?.data?.dato) {
      this.form.patchValue(this.config.data.dato);
    }

    // Si solo te mandan el id:
    if (this.config?.data?.id) {
      this.obtenerRegistro(this.config.data.id);
    }
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
       nombre: [ '',],
            apellidoPaterno: ['',],
            apellidoMaterno: ['',],
            nombreComercial: ['',],
            rfc: ['',],
            sociedad: ['',],
            telefono: ['',],
            regimenFiscal: ['',],
            direccion: ['',],
            codigoPostal: ['',],
            tipoPersona: ['',],
            fechaActualizacion: ['',],
    });
  }

  obtenerRegistro(id: number) {
    this.service.obtenerRegistro(id).subscribe({
      next: (response) => {
        let datos: any = { ...response.data };
        this.form.patchValue(datos);
      },
    });
  }

  eventoCancelar() {
    this.ref.close(); // 🔥 ahora cierra el modal
  }
}
