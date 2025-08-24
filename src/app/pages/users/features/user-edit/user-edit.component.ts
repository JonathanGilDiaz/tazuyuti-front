import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Rol, Sucursal } from '@app/core/interfaces/apiResponse';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { LayoutComponent } from '@app/shared/ui/layout/layout.component';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { UsuariosService } from '@app/data/services/usuarios.service';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { OnlyTextDirective } from '@app/shared/directives/only-text.directive';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    DinamicFormComponent,
    ReactiveFormsModule,
    OnlyTextDirective,
    DropdownModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent {

  form:                       FormGroup;
  roles:                      Rol[] = [];
  sucursales:                 Sucursal[] = [];
  cambioUsuario:  boolean = false; // vatiable que guardara si es que el valor del correo institucional fue cambiado.
  valorAnterior:              string;
  loading:                    boolean = false;
  destroy$=                   new Subject<void>();

  constructor(private fb:     FormBuilder,
    private activatedRoute:   ActivatedRoute,
    private usuarioService:   UsuariosService,
    private modalService:     ModalService,
    private router:           Router
  ){
    this.obtenerCatalogos();
    this.iniciarFormulario();
    this.activatedRoute.params.subscribe({
      next : params =>{
        this.obtenerRegistro(params['id']);
      }
    });
  }

  ngOnInit(): void {
  }

  iniciarFormulario(): void{
    this.form=this.fb.group({
      id : [null],
      nombre: ['', [Validators.required]],
      sucursal_id: ['', [Validators.required]],
      contrasenia: [''],
      rol_id: ['', [Validators.required]],
    });
    //this.form.get('correoInstitucional').disable();
  }

  cambioValorUsuario(value : any){
    this.cambioUsuario = value.target.value != this.valorAnterior;
  }
  

  obtenerRegistro(id: number) {
    this.loading = true;
    this.usuarioService.catalogos().pipe(
      tap(responseCat => {
        this.roles = responseCat.data.roles;
        this.sucursales = responseCat.data.sucursales;
      }), 
      switchMap(() => this.usuarioService.obtenerRegistro(id)) 
    ).subscribe({
      next: response => {
        let datos: any = {
          ...response.data,
          rol_id: response.data.rol.id,
          sucursal_id: response.data.sucursal.id,
        };

        const rolId = response.data.rol.id;
        const sucursalId = response.data.sucursal.id;
        datos = {
          ...datos,
        };
        delete datos.contrasenia;

        this.form.patchValue(datos);
        this.form.updateValueAndValidity();
        this.valorAnterior = this.form.get('usuario').value;
        this.loading = false;
      },
      error: err => this.modalService.openAlertModal('error','Error', err).subscribe()
    });
    this.loading = false;
  }


  obtenerCatalogos(){
    this.loading = true;
    this.usuarioService.catalogos().subscribe({
      next : response => {
        if(response.success){
          this.roles = response.data.roles;
          this.sucursales = response.data.sucursales;
          this.loading = false;
        }else{
          this.loading = false;
          this.modalService.openAlertModal('error','Error', response.message).subscribe();
        }
      }
    });
    this.loading = false;
  }

  eventoCancelar(){
    this.modalService.openAlertModal('advertencia','Atención', '¿Está seguro de cancelar la acción?',true).subscribe({
      next : response =>{
        if(response.resultado){
          this.router.navigate(['usuarios']);
        }
      }
    });
  }

  onSubmit(){
    if(this.form.valid)
      {
        this.modalService.openAlertModal('advertencia','Atención', '¿Está seguro de guardar los datos?',true).subscribe({
          next : response =>{
            this.loading = true;
            if(response.resultado){
              const rolId = this.form.get('rol_id').value;
              const sucursalId = this.form.get('sucursal_id').value;

              let datos: any = {
                ...this.form.getRawValue(),
                rol: { id: parseInt(rolId) },
                sucursal: { id: parseInt(sucursalId) }
              };

              datos = {
                ...datos,
              };
              this.usuarioService.actualizarRegistro(datos).subscribe(
                {
                  next: response=>{
                    if(response.success){
                      this.loading = false;
                      let mensaje =response.message;
                       this.modalService.openAlertModal('exito','Éxito', mensaje).subscribe({
                        complete : () =>{
                          this.router.navigate(['/usuarios']);
                        }
                      });
                    }else{
                      this.loading = false;
                      let info = Object.keys(response.data).length > 0 ? response.data.errors : response.message;
                      if(!response.data.description?.includes("expirado")){
                        this.modalService.openAlertModal('error','Error', info).subscribe({
                          next : () => {
                              Object.keys(this.form.controls).forEach(key => {
                                this.form.controls[key].markAsTouched();
                              });
                          }
                        });
                      }
                    }
                  }
                }
              );
            }
            this.loading = false;
          }
        });    
      }else{
        this.modalService.openAlertModal('error','Error', 'Hay datos del formulario que son requeridos, favor de ingresarlos para completar el registro.').subscribe({
          next : () => {
              Object.keys(this.form.controls).forEach(key => {
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
