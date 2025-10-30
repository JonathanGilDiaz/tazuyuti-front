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
import { ProductosService } from '@app/data/services/productos.service';
import { GlobalError } from '@app/core/interfaces/errors.interface';
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
    DropdownModule,
  ],
  templateUrl: './producto-add.component.html',
  styleUrl: './producto-add.component.css',
})
export class ProductoAddComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private modalService: ModalService,
    public ref: DynamicDialogRef
  ) {
    this.iniciarFormulario();
  }

  ngOnInit(): void {
    this.form.get('unidad')?.valueChanges.subscribe((unidad) => {
      const cantidadCtrl = this.form.get('cantidad');
      if (!cantidadCtrl) return;
      let valorActual = cantidadCtrl.value;
      if (unidad === 'Pieza') {
        if (valorActual != null && valorActual !== '') {
          valorActual = Math.round(parseFloat(valorActual));
          cantidadCtrl.setValue(valorActual, { emitEvent: false });
        }
        cantidadCtrl.setValidators([
          Validators.required,
          Validators.pattern(/^\d+$/),
        ]);
      } else if (unidad === 'Granel') {
        cantidadCtrl.setValidators([
          Validators.required,
          Validators.pattern(/^\d+(\.\d+)?$/),
        ]);
      }
      cantidadCtrl.updateValueAndValidity();
    });
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      unidad: ['Pieza', [Validators.required]],
      costo: ['', [Validators.required]],
      precio: ['', Validators.required],
      cantidad: ['', Validators.required],
    });
  }

  eventoCancelar() {
    this.ref.close(null);
  }

  onSubmit() {
    if (this.form.valid) {
      Object.keys(this.form.controls).forEach((key) => {
        if (this.form.controls[key].value === '') {
          this.form.controls[key].setValue(null);
        }
      });

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
            this.ref.close(true);
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
