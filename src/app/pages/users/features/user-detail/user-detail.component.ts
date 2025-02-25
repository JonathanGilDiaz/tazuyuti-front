import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DinamicFormComponent } from '@app/shared/ui/dinamic-form/dinamic-form/dinamic-form.component';
import { LayoutComponent } from '@app/shared/ui/layout/layout.component';
import { UsuariosService } from '@app/data/services/usuarios.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    DinamicFormComponent,
    ReactiveFormsModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {

  form: FormGroup;

  constructor(private fb: FormBuilder,
    private activatedRoute : ActivatedRoute,
    private usuarioService : UsuariosService,
    private router : Router
  ){
    this.iniciarFormulario();
    this.activatedRoute.params.subscribe({
      next : params =>{
        this.obtenerRegistro(params['id']);
      }
    });
  }

  iniciarFormulario(): void{
    this.form=this.fb.group({
      nombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
      correoPersonal: [''],
      cargo: [''],
      usuario : [''],
      telefono: [''],
      celular: [''],
      extension: [''],
      rol: [''],
    });
  }

  obtenerRegistro(id : number){
    this.usuarioService.obtenerRegistro(id).subscribe({
      next : response =>{

        let datos: any = {
          ...response.data,
          rol: response.data.rol
        };
        this.form.patchValue(datos);
      }
    });
  }

  eventoCancelar(){
    this.router.navigate(['usuarios']);
  }

}
