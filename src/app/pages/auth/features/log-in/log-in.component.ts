import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PaswordInputComponent } from '@app/shared/ui/pasword-input-component/pasword-input-component.component';
import { ButtonModule } from 'primeng/button';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha-2';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { MODULES_URLS } from '@app/constants/app.constants';
import { AuthService } from '@app/core/services/auth.service';
import { LoginData } from '@app/data/models/login';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';

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
    ReactiveFormsModule,
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent implements OnInit {
  logoPath = 'assets/template/images/logo-oax.png';
  logoVertical = 'assets/template/images/logo-vertical-2.png';
  logoTecnologias = 'assets/template/images/TECNOLOGIAS.png';
  captcha = 'assets/template/images/captcha.png';
  siteKey = environment.recaptcha.siteKey;

  formLogin: FormGroup;
  formSaldo: FormGroup;
  destroy$ = new Subject<void>();

  private modalRef: NgbModalRef;
  private usuarioIdFaltante: number;
  private loginDataPendiente: LoginData;

  @ViewChild('modalCorte') modalCorteTpl: TemplateRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modal: NgbModal,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    if (this.authService.isAuthenticated()) {
      this.router.navigate([MODULES_URLS.PUBLIC.DEFAULT]);
    }
  }

  iniciarFormulario(): void {
    this.formLogin = this.formBuilder.group({
      usuario: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]],
      token: ['', [Validators.required]],
    });

    this.formSaldo = this.formBuilder.group({
      saldoInicial: ['', [Validators.required, Validators.min(0)]],
    });
  }

  passwordChange(event: string) {
    this.formLogin.get('contrasenia').setValue(event);
  }

  iniciarSesion(form: FormGroup): void {
    if (!form.valid) {
      return;
    }

    let username = form.controls['usuario'].value;
    let password = form.controls['contrasenia'].value;

    let dataLogin: LoginData = {
      usuario: username,
      password: password,
      recaptchaResponse: this.formLogin.get('token').value,
    };

    this.authService
      .login(dataLogin)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.authService.guardarUsuario(response.data.usuario);
            this.authService.guardarToken(response.data.token);
            this.authService.guardarMenu(response.data.menus);
            this.router.navigate(['dashboard']);
          } else {
            if (response.message.includes('Falta crear un corte')) {
              this.usuarioIdFaltante = response.data?.usuarioId;
              this.loginDataPendiente = dataLogin;
              this.abrirModalCorte();
            }
          }
        },
        error: (error) => {
          if (error.error?.message?.includes('Falta crear un corte')) {
            this.usuarioIdFaltante = error.error.data?.usuarioId;
            this.loginDataPendiente = dataLogin;
            this.abrirModalCorte();
          }else{
              this.modalService
              .openAlertModal('error', 'Error', error.error?.message)
              .pipe(takeUntil(this.destroy$))
              .subscribe();        
          }
        },
      });
  }

  abrirModalCorte() {
    this.formSaldo.reset();
    this.modalRef = this.modal.open(this.modalCorteTpl, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
  }

  confirmarCorte() {
    if (this.formSaldo.invalid) {
      this.formSaldo.markAllAsTouched();
      return;
    }

    const saldoInicial = this.formSaldo.get('saldoInicial')?.value;

    this.authService
      .crearCorte(this.usuarioIdFaltante, saldoInicial)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          if (!resp.success) return;
          this.modalRef.close();
          this.modalService
            .openAlertModal('exito', 'Éxito', 'Corte creado exitosamente')
            .subscribe({
              complete: () => {
                setTimeout(() => window.location.reload(), 100);
              },
            });
        },
        error: (err) => console.error('Error al crear corte', err),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
