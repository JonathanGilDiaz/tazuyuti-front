import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { ProductosService } from '@app/data/services/productos.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './producto-detail.component.html',
  styleUrl: './producto-detail.component.css',
})
export class ProductoDetailComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {
    this.iniciarFormulario();

    // Si viene el producto completo:
    if (this.config?.data?.producto) {
      this.form.patchValue(this.config.data.producto);
    }

    // Si solo te mandan el id:
    if (this.config?.data?.id) {
      this.obtenerRegistro(this.config.data.id);
    }
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      codigo: [''],
      nombre: [''],
      descripcion: [''],
      unidad: [''],
      costo: [''],
      precio: [''],
      fechaActualizacion: [''],
      
    });
  }

  obtenerRegistro(id: number) {
    this.productosService.obtenerRegistro(id).subscribe({
      next: (response) => {
        let datos: any = { ...response.data };
        this.form.patchValue(datos);
      },
    });
  }

  eventoCancelar() {
    this.ref.close();
  }
}
