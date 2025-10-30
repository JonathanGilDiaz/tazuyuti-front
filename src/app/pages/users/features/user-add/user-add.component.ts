import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Rol, Sucursal } from '@app/core/interfaces/apiResponse';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { LayoutComponent } from '@app/shared/ui/layout/layout.component';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { UsuariosService } from '@app/data/services/usuarios.service';
import { OnlyTextDirective } from '@app/shared/directives/only-text.directive';
import { GlobalError } from '@app/core/interfaces/errors.interface';
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    DinamicFormComponent,
    ReactiveFormsModule,
    OnlyTextDirective,
    DropdownModule,
  ],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css',
})
export class UserAddComponent implements OnInit {
  form: FormGroup;
  roles: Rol[] = [];
  sucursales: Sucursal[] = [];
  loading: boolean = false;
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private usuariosServicio: UsuariosService,
    private modalService: ModalService,
    private router: Router
  ) {
    this.obtenerCatalogos();
    this.iniciarFormulario();
  }
  ngOnInit(): void {}

  iniciarFormulario(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      contrasenia: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
      sucursal_id: ['', [Validators.required]],
      rol_id: ['', [Validators.required]],
    });
  }

  obtenerCatalogos() {
    this.loading = true;
    this.usuariosServicio.catalogos().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data.roles;
          this.sucursales = response.data.sucursales;
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

  eventoCancelar() {
    this.router.navigate(['usuarios']);
  }

  onSubmit() {
    if (this.form.valid) {
      Object.keys(this.form.controls).forEach((key) => {
        if (this.form.controls[key].value == '')
          this.form.controls[key].setValue(null);
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
            this.loading = true;
            if (response.resultado) {
              const rolId = this.form.get('rol_id').value;
              const sucursalId = this.form.get('sucursal_id').value;
              let datos: any = {
                ...this.form.value,
                rol: { id: parseInt(rolId) },
                sucursal: { id: parseInt(sucursalId) },
              };

              datos = {
                ...datos,
                rol: { id: rolId },
                sucursal: { id: sucursalId },
              };
              this.usuariosServicio.agregarRegistro(datos).subscribe({
                next: (response) => {
                  if (response.success) {
                    this.loading = false;
                    this.router.navigate(['/usuarios']);
                  } else {
                    this.loading = false;
                    //let info = Object.keys(response.data).length > 0 ? response.data.errors : response.message;
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
            this.loading = false;
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
