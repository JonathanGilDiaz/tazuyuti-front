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
import { Subject, switchMap, tap } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Unidad } from '@app/core/interfaces/apiResponse';
import { RutasService } from '@app/data/services/rutas.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
    DropdownModule,
  ],
  templateUrl: './rutas-edit.component.html',
  styleUrl: './rutas-edit.component.css',
})
export class RutasEditComponent {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();
  Unidades: Unidad[] = [];
  diasSemana = [
    { label: 'Lunes', value: 'lunes' },
    { label: 'Martes', value: 'martes' },
    { label: 'Miércoles', value: 'miercoles' },
    { label: 'Jueves', value: 'jueves' },
    { label: 'Viernes', value: 'viernes' },
    { label: 'Sábado', value: 'sabado' },
    { label: 'Domingo', value: 'domingo' },
  ];
  diasSeleccionados: string[] = [];
  constructor(
    private fb: FormBuilder,
    private service: RutasService,
    private modalService: ModalService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {
    this.obtenerCatalogos();
    this.iniciarFormulario();
    if (this.config?.data?.item) {
      this.obtenerRegistro(this.config?.data?.item.id);
    }
  }

  ngOnInit(): void {}

  onDiaChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.diasSeleccionados.push(input.value);
    } else {
      this.diasSeleccionados = this.diasSeleccionados.filter(
        (d) => d !== input.value
      );
    }
    this.form.get('repeticion')?.setValue(this.diasSeleccionados.join(','));
  }

  seleccionarTodos() {
    this.diasSeleccionados = this.diasSemana.map((d) => d.value);
    this.form.get('repeticion')?.setValue(this.diasSeleccionados.join(','));
  }

  obtenerCatalogos() {
    this.loading = true;
    this.service.catalogos().subscribe({
      next: (response) => {
        if (response.success) {
          this.Unidades = response.data.unidades;
          this.loading = false;
        } else {
          this.loading = false;
          this.modalService
            .openAlertModal('error', 'Error', response.message)
            .subscribe();
        }
      },
    });
    this.loading = false;
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      id: [null],
      viaje: ['', [Validators.required]],
      unidad: ['', [Validators.required]],
      repeticion: ['', [Validators.required]],
      hora: ['', [Validators.required]],
    });
  }

  obtenerRegistro(id: number) {
    this.loading = true;
    this.service.obtenerRegistro(id).subscribe({
      next: (response) => {
        const r = response.data;

        this.diasSeleccionados = (r.repeticion || '')
          .split(',')
          .map((d: string) => d.trim().toLowerCase())
          .filter((d: string) => !!d);

        this.form.patchValue({
          id: r.id,
          viaje: r.viaje,
          unidad: r.unidad?.id,
          repeticion: this.diasSeleccionados.join(','),
          hora: r.hora,
        });

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.modalService.openAlertModal('error', 'Error', err).subscribe();
      },
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
                    const info =
                      Object.keys(response.data || {}).length > 0
                        ? response.data.errors
                        : response.message;

                    if (!response.data?.description?.includes('expirado')) {
                      this.modalService
                        .openAlertModal('error', 'Error', info)
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
                error: (err) => {
                  this.loading = false;
                  this.modalService
                    .openAlertModal('error', 'Error', err.error.message)
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
