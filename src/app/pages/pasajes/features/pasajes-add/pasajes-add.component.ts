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
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PreciosBoletosService } from '@app/data/services/preciosBoletos.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
    DropdownModule,
  ],
  templateUrl: './pasajes-add.component.html',
  styleUrl: './pasajes-add.component.css',
})
export class PasajesAddComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();
  sucursales = [
    { id: 1, nombre: 'Oaxaca' },
    { id: 2, nombre: 'Huajuapam' },
    { id: 3, nombre: 'Tonalá' },
    { id: 4, nombre: 'Juxtlahuaca' },
  ];
  constructor(
    private fb: FormBuilder,
    private service: PreciosBoletosService,
    private modalService: ModalService,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.iniciarFormulario();
  }
  ngOnInit(): void {}

  iniciarFormulario(): void {
    this.form = this.fb.group({
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      tipoDestino: ['', Validators.required], // base o intermedio
      sucursalDestino: [''], // si elige base
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
    const candidatos = [];

    if (i1 > 0) candidatos.push(this.rutas[i1 - 1]);
    if (i1 < this.rutas.length - 1) candidatos.push(this.rutas[i1 + 1]);

    return this.sucursales.filter((s) => candidatos.includes(s.id));
  }

  rutas = [1, 2, 3, 4]; // ids de Oaxaca, Huajuapam, Tonalá, Juxtlahuaca

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

  eventoCancelar() {
    this.ref.close(null);
  }

  onSubmit() {
    if (this.form.valid) {
      const datos = new FormData();
      const value = this.form.value;

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

      this.loading = true;
      this.service.agregarRegistro(datos).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.ref.close(true);
          } else {
            this.modalService
              .openAlertModal('error', 'Error', response.message)
              .subscribe();
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
    } else {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Hay datos requeridos que faltan, favor de ingresarlos.'
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
