import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { OnlyTextDirective } from '@app/shared/directives/only-text.directive';
import { GlobalError } from '@app/core/interfaces/errors.interface';
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ClienteService } from '@app/data/services/clientes.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    CommonModule,
    DinamicFormComponent,
    ReactiveFormsModule,
    OnlyTextDirective,
    DropdownModule,
  ],
  templateUrl: './cliente-add.component.html',
  styleUrl: './cliente-add.component.css',
})
export class ClienteAddComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private service: ClienteService,
    private modalService: ModalService,
    private router: Router,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.iniciarFormulario();
  }
  ngOnInit(): void {}

  iniciarFormulario(): void {
    this.form = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
         
        ],
      ],
      apellidoPaterno: ['',],
      apellidoMaterno: ['',],
      nombreComercial: ['',],
      rfc: ['',],
      sociedad: ['',],
      telefono: ['',],
      regimenFiscal: ['',],
      direccion: ['',],
      codigoPostal: ['',],
      tipoPersona: ['Persona Física',],
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
            
              this.service.agregarRegistro(datos).subscribe({
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
