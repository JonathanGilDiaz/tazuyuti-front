import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, interval, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalService } from '@app/data/services/local.service';
import { DEFAULT_VALUES, MODULES_URLS } from '@app/constants/app.constants';
import { Router } from '@angular/router';
import {
  ApiResponse,
  MenuElement,
  Usuario,
  UsuarioData,
} from '../interfaces/apiResponse';
import { LoginData } from '@app/data/models/login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: Usuario | null = null;
  private token: string | null = null;
  private expirationTimeout: any;
  private expirationSubscription: Subscription | null = null;
  private expirationTimeSubject = new BehaviorSubject<number | null>(null);
  expirationTime$ = this.expirationTimeSubject.asObservable();
  private readonly expirationTime =
    DEFAULT_VALUES.EXPIRATION_SESSION_TIME_IN_MINUTES * 60 * 1000;

  constructor(
    private httpClient: HttpClient,
    private localStore: LocalService,
    private router: Router
  ) {
    this.initializeSession();
  }

  private initializeSession(): void {
    const storedExpirationTime = this.localStore.getData('expirationTime');
    if (storedExpirationTime) {
      const remainingTime = Number(storedExpirationTime) - Date.now();
      remainingTime > 0
        ? this.startSessionTimeout(remainingTime)
        : this.logout();
    } else {
      this.resetExpirationTime();
    }
  }

  private resetExpirationTime(): void {
    const newExpirationTime = Date.now() + this.expirationTime;
    this.localStore.saveData('expirationTime', newExpirationTime.toString());
    this.startSessionTimeout(this.expirationTime);
  }

  private startSessionTimeout(duration: number): void {
    this.clearSessionTimeout();
    this.expirationTimeout = setTimeout(() => this.logout(), duration);
    this.updateExpirationCountdown(duration);
  }

  private updateExpirationCountdown(duration: number): void {
    if (this.expirationSubscription) this.expirationSubscription.unsubscribe();
    const startTime = Date.now();
    this.expirationSubscription = interval(1000).subscribe(() => {
      const remainingTime = duration - (Date.now() - startTime);

      if (remainingTime <= 0) {
        this.logout();
      } else {
        this.expirationTimeSubject.next(remainingTime);
      }
    });
  }

  private clearSessionTimeout(): void {
    if (this.expirationTimeout) clearTimeout(this.expirationTimeout);
    this.expirationTimeout = null;
    this.expirationSubscription?.unsubscribe();
    this.expirationSubscription = null;
  }

  public getUsuario(): Usuario | null {
    if (!this.user) {
      const storedUser = localStorage.getItem('usuario');
      this.user = storedUser ? JSON.parse(storedUser) : null;
    }
    return this.user;
  }

  public getMenu(): MenuElement[] | null {
    const storedMenu = localStorage.getItem('menu');
    return storedMenu ? JSON.parse(storedMenu) : null;
  }

  public getToken(): string | null {
    this.token = this.localStore.getData('token');
    return this.token;
  }

  public login(dataLogin: LoginData): Observable<ApiResponse<UsuarioData>> {
    const urlEndpoint = `${environment.baseUrl}/auth/login`;
    return this.httpClient
      .post<ApiResponse<UsuarioData>>(urlEndpoint, dataLogin)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.guardarToken(response.data.token);
            this.guardarUsuario(response.data.usuario);
            this.resetExpirationTime();
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  crearCorte(usuarioId: number, saldoInicial: number): Observable<any> {
    const body = {
      usuario: { id: usuarioId },
      saldoInicial: saldoInicial,
    };
    return this.httpClient.post(`${environment.baseUrl}/corte/crear`, body);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public guardarUsuario(response: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(response));
    this.startSessionTimeout(this.expirationTime);
  }

  public guardarToken(accessToken: string): void {
    this.token = accessToken;
    this.localStore.saveData('token', accessToken);
  }

  public guardarMenu(menu: MenuElement[]): void {
    localStorage.setItem('menu', JSON.stringify(menu));
  }

  public logout(): void {
    // Limpiar el temporizador de expiración
    this.clearSessionTimeout();

    // Cancela la suscripción del temporizador de cuenta regresiva
    if (this.expirationSubscription) {
      this.expirationSubscription.unsubscribe();
      this.expirationSubscription = null;
    }

    // Limpia el almacenamiento local y otros datos de sesión
    this.cerrarSesionLocal();
  }

  cerrarSesionLocal(): void {
    this.user = null;
    this.token = null;
    this.localStore.clearData();
    this.router.navigate([MODULES_URLS.AUTH.LOGIN]).then(() => {});
  }
}
