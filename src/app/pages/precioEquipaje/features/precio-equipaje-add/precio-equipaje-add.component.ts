import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { GlobalError } from '@app/core/interfaces/errors.interface';
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PreciosEquipajeService } from '@app/data/services/preciosEquipaje.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [ CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
    DropdownModule,],
  templateUrl: './precio-equipaje-add.component.html',
  styleUrl: './precio-equipaje-add.component.css',
})
export class PrecioEquipajeAddComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productosService: PreciosEquipajeService,
    private modalService: ModalService,
    public ref: DynamicDialogRef
  ) {
    this.iniciarFormulario();
  }
  ngOnInit(): void {}

  iniciarFormulario(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      peso: ['', [Validators.required]],
      medidas: ['', [Validators.required]],
      precio: ['', Validators.required],
    });
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
            this.ref.close(null);
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

      this.modalService
        .openAlertModal(
          'advertencia',
          'Atención',
          '¿Está seguro de guardar los datos?',
          true
        )
        .subscribe({
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

              this.productosService.agregarRegistro(datos).subscribe({
                next: (response) => {
                  this.loading = false;
                  if (response.success) {
                    this.modalService
                      .openAlertModal('exito', 'Éxito', response.message)
                      .subscribe({
                        complete: () => {
                          this.ref.close(true);
                        },
                      });
                  } else {
                    if (!response.data.description?.includes('expirado')) {
                      this.modalService
                        .openAlertModal('error', 'Error', response.message)
                        .subscribe({
                          next: () => {
                            Object.keys(this.form.controls).forEach((key) => {
                              this.form.controls[key].markAsTouched();
                            });
                          },
                        });
                    }
                  }
                },
                error: (err: GlobalError) => {
                  this.loading = false;
                  this.modalService
                    .openAlertModal('error', 'Error', err.error.message)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe();
                },
              });
            }
          },
        });
    } else {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Hay datos del formulario que son requeridos, favor de ingresarlos para completar el registro.'
        )
        .subscribe({
          next: () => {
            Object.keys(this.form.controls).forEach((key) => {
              this.form.controls[key].markAsTouched();
            });
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
