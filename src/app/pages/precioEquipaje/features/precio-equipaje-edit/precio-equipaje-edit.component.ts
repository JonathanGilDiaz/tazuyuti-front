import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PreciosEquipajeService } from '@app/data/services/preciosEquipaje.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
    DropdownModule,
  ],
  templateUrl: './precio-equipaje-edit.component.html',
  styleUrl: './precio-equipaje-edit.component.css',
})
export class PrecioEquipajeEditComponent {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();

constructor(
  private fb: FormBuilder,
  private service: PreciosEquipajeService,
  private modalService: ModalService,
  public config: DynamicDialogConfig,
  public ref: DynamicDialogRef
  ) {
    this.iniciarFormulario();
      if (this.config?.data?.precio) {
    this.form.patchValue(this.config.data.precio);
  }
  }

  ngOnInit(): void {
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      id: [null],
       nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      peso: ['', [Validators.required]],
      medidas: ['', [Validators.required]],
      precio: ['', Validators.required],
    });
  }

  obtenerRegistro(id: number) {
    this.loading = true;
    this.service.obtenerRegistro(id).subscribe({
      next: (response) => {
        let datos: any = {
          ...response.data,
        };
        this.form.patchValue(datos);           
        this.form.updateValueAndValidity();
        this.loading = false;
      },
      error: (err) =>
        this.modalService.openAlertModal('error', 'Error', err).subscribe(),
    });
    this.loading = false;
  }

  convertirFecha(fecha: string): string {
    const partes = fecha.split('/');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  eventoCancelar() {
    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de cancelar la acción?',
        true
      )
      .subscribe({
        next: (response) => {
          if (response.resultado) {
            this.ref.close(true);
          }
        },
      });
  }

onSubmit() {
  if (this.form.valid) {
    Object.keys(this.form.controls).forEach((key) => {
      if (this.form.controls[key].value === '') {
        this.form.controls[key].setValue(null);
      }
    });

    this.modalService.openAlertModal(
      'advertencia',
      'Atención',
      '¿Está seguro de guardar los datos?',
      true
    ).subscribe({
      next: (response) => {
        if (response.resultado) {
          this.loading = true;

          const datos = new FormData();
          Object.keys(this.form.controls).forEach((key) => {
            const value = this.form.controls[key].value;
            if (value !== null && value !== undefined) {
              datos.append(key, value);
            }
          });

          this.service.actualizarRegistro(datos).subscribe({
            next: (response) => {
              this.loading = false;
              if (response.success) {
                this.modalService
                  .openAlertModal('exito', 'Éxito', response.message)
                  .subscribe({
                    complete: () => {
                      this.ref.close(true); // ✅ cierra el modal y avisa al padre que refresque
                    },
                  });
              } else {
                const info = Object.keys(response.data || {}).length > 0
                  ? response.data.errors
                  : response.message;

                if (!response.data?.description?.includes('expirado')) {
                  this.modalService.openAlertModal('error', 'Error', info).subscribe({
                    next: () => {
                      Object.keys(this.form.controls).forEach((key) => {
                        this.form.controls[key].markAsTouched();
                      });
                    },
                  });
                }
              }
            },
            error: (err) => {
              this.loading = false;
              this.modalService.openAlertModal('error', 'Error', err.error.message).subscribe();
            },
          });
        }
      }
    });
  } else {
    this.modalService.openAlertModal(
      'error',
      'Error',
      'Hay datos del formulario que son requeridos, favor de ingresarlos para completar el registro.'
    ).subscribe({
      next: () => {
        Object.keys(this.form.controls).forEach((key) => {
          this.form.controls[key].markAsTouched();
        });
      }
    });
  }
}

  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
