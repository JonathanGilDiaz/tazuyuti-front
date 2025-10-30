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
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PreciosBoletosService } from '@app/data/services/preciosBoletos.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
    DropdownModule,
  ],
  templateUrl: './pasajes-edit.component.html',
  styleUrl: './pasajes-edit.component.css',
})
export class PasajesEditComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();

  sucursales = [
    { id: 1, nombre: 'Oaxaca' },
    { id: 2, nombre: 'Huajuapam' },
    { id: 3, nombre: 'Tonalá' },
    { id: 4, nombre: 'Juxtlahuaca' },
  ];

  rutas = [1, 2, 3, 4]; // ids ordenados

  constructor(
    private fb: FormBuilder,
    private service: PreciosBoletosService,
    private modalService: ModalService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {
    this.iniciarFormulario();
  }

  ngOnInit(): void {
    if (this.config?.data?.precio) {
      this.obtenerRegistro(this.config.data.precio.id);
    }
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      id: [null],
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      tipoDestino: ['', Validators.required],
      sucursalDestino: [''],
      intermedio: this.fb.group({
        entre1: [''],
        entre2: [''],
      }),
      precio: ['', [Validators.required, Validators.min(1)]],
    });
  }

  get sucursalesDestino() {
    const origen = this.form?.get('origen')?.value;
    return this.sucursales.filter((s) => s.id !== Number(origen));
  }

  get intermediosEntre2() {
    const entre1 = this.form?.get('intermedio.entre1')?.value;
    if (!entre1) return this.sucursales;

    const i1 = this.rutas.indexOf(Number(entre1));
    const candidatos: number[] = [];

    if (i1 > 0) candidatos.push(this.rutas[i1 - 1]);
    if (i1 < this.rutas.length - 1) candidatos.push(this.rutas[i1 + 1]);

    return this.sucursales.filter((s) => candidatos.includes(s.id));
  }

  validarRuta() {
    const { entre1, entre2 } = this.form.get('intermedio')?.value;
    const i1 = this.rutas.indexOf(Number(entre1));
    const i2 = this.rutas.indexOf(Number(entre2));
    if (Math.abs(i1 - i2) !== 1) {
      this.modalService
        .openAlertModal('error', 'Error', 'La ruta seleccionada no es válida')
        .subscribe();
      return false;
    }
    return true;
  }

  obtenerRegistro(id: number) {
    this.loading = true;
    this.service
      .obtenerRegistro(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            const dato = response.data;
            // Mapea datos al formulario
            this.form.patchValue({
              id: dato.id,
              origen: dato.origen?.id,
              destino: dato.destino,
              precio: dato.precio,
            });

            // Si entre1 == entre2 => es destino base
            if (dato.entre1?.id === dato.entre2?.id) {
              this.form.patchValue({
                tipoDestino: 'base',
                sucursalDestino: dato.entre1?.id,
              });
            } else {
              this.form.patchValue({
                tipoDestino: 'intermedio',
                intermedio: {
                  entre1: dato.entre1?.id,
                  entre2: dato.entre2?.id,
                },
              });
            }
          } else {
            this.modalService
              .openAlertModal('error', 'Error', response.message)
              .subscribe();
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

  eventoCancelar() {
    this.ref.close(true);
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const value = this.form.value;
      const datos = new FormData();

      datos.append('id', value.id);
      datos.append('origen', value.origen);
      datos.append('destino', value.destino);
      datos.append('precio', value.precio);

      if (value.tipoDestino === 'base') {
        datos.append('entre1', value.sucursalDestino);
        datos.append('entre2', value.sucursalDestino);
      } else if (value.tipoDestino === 'intermedio') {
        if (!this.validarRuta()) return;
        datos.append('entre1', value.intermedio.entre1);
        datos.append('entre2', value.intermedio.entre2);
      }

      this.service.actualizarRegistro(datos).subscribe({
        next: (resp) => {
          this.loading = false;
          if (resp.success) {
            this.ref.close(true);
          } else {
            this.modalService
              .openAlertModal('error', 'Error', resp.message)
              .subscribe();
          }
        },
        error: (err) => {
          this.loading = false;
          this.modalService
            .openAlertModal('error', 'Error', err.error.message)
            .subscribe();
        },
      });
    } else {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Hay campos requeridos que faltan por completar.'
        )
        .subscribe(() => {
          Object.keys(this.form.controls).forEach((key) => {
            this.form.controls[key].markAsTouched();
          });
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
