import { HttpErrorResponse, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const modalService = inject(ModalService);
  return next(req).pipe(tap(event => {
    if (event.type === HttpEventType.Response) {
      let response = (event.body as any);
      if(response.message && !response.success){

      }
    }
  }),catchError((error: HttpErrorResponse) => {
    let mensajeError : string  = error.error.message;
    if(mensajeError.includes('token ha expirado')){
      modalService.openAlertModal('informacion','Información', 'Tu sesión ha sido finalizada debido a un nuevo inicio de sesión en otro dispositivo. Si deseas continuar aquí, por favor vuelve a iniciar sesión.').subscribe();
      authService.cerrarSesionLocal();
    }
    return throwError(() => error);
  }));
};
