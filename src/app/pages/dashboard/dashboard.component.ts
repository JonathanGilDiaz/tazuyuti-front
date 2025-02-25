import { LocalService } from './../../data/services/local.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { APP } from '@app/constants/app.constants';
import { LayoutComponent } from '@app/shared/ui/layout/layout.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [LayoutComponent, ReactiveFormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  form: FormGroup;
  titulo: string;

  constructor(
    private fb: FormBuilder,
    private localStore: LocalService
  ){
    const usuario = JSON.parse(this.localStore.getData('usuario') ?? '{}');
    this.titulo = `${APP.WELCOME} ${usuario?.nombre ?? 'usuario'}`;
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      rol_id: ['', Validators.required]
      // Agregar más controles aquí
    });
  }

  eventoCancelar(){
  }

  onSubmit(){
  }
}
