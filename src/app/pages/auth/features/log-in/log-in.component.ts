import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PaswordInputComponent } from '@app/shared/ui/pasword-input-component/pasword-input-component.component';
import { ButtonModule } from 'primeng/button';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha-2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { environment } from 'src/environments/environment';

import { EncryptTextService } from '@app/utils/encrypt-text.service';
import { Router } from '@angular/router';
import { MODULES_URLS } from '@app/constants/app.constants';
import { AuthService } from '@app/core/services/auth.service';
import { LoginData } from '@app/data/models/login';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PaswordInputComponent,
    RecaptchaModule,
    RecaptchaFormsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent implements OnInit{
  logoPath = 'assets/template/images/logo-oax.png';
  logoVertical = 'assets/template/images/logo-vertical-2.png';
  logoTecnologias = 'assets/template/images/TECNOLOGIAS.png';
  captcha = 'assets/template/images/captcha.png';
  siteKey =environment.recaptcha.siteKey;
  formLogin:FormGroup;
  destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService : AuthService,
    private modalService: ModalService,
    private encryptTextService : EncryptTextService,
    private router : Router,
  ){

  }
  ngOnInit(): void {
    this.iniciarFormulario(); // Inicializa el formulario antes de verificar la autenticación
    if (this.authService.isAuthenticated()) {
      this.router.navigate([MODULES_URLS.PUBLIC.DEFAULT]);
    }
  }

  iniciarFormulario(): void{
    this.formLogin=this.formBuilder.group({
      usuario: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]],
      token: ['', [Validators.required]]
    });
  }

  passwordChange(event :string){
    this.formLogin.get('contrasenia').setValue(event);
  }

  iniciarSesion(form: FormGroup): void {
    if (form.valid) {
      let username = form.controls['usuario'].value;
      let password = form.controls['contrasenia'].value;
      
      let dataLogin: LoginData = { 
        usuario: username, 
        password: password,
        recaptchaResponse: this.formLogin.get('token').value
      };
  
      this.authService.login(dataLogin).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          if (response.success) {
            this.authService.guardarUsuario(response.data.usuario);
            this.authService.guardarToken(response.data.token);
            this.authService.guardarMenu(response.data.menus);
            this.router.navigate(['dashboard']);
          } else {
            let mensaje = response.message == "Bad credentials" ? 'Datos de acceso incorrectos' : response.message;
            this.modalService.openAlertModal('error', 'Error', mensaje).pipe(takeUntil(this.destroy$)).subscribe();
          }
        },
        error => {
          this.formLogin.get('token').reset();
          let mensaje = error.error.message == "Bad credentials" ? 'Datos de acceso incorrectos' : error.error.message;
          this.modalService.openAlertModal('error', 'Error', mensaje).pipe(takeUntil(this.destroy$)).subscribe();
        }
      );
    } else {
      this.modalService.openAlertModal('error', 'Error', 'Datos incompletos, favor de ingresarlos para iniciar sesión').pipe(takeUntil(this.destroy$)).subscribe();
    }
  }
  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}