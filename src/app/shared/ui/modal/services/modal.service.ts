import { inject, Injectable, TemplateRef } from '@angular/core';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ModalComponent } from '../components/modal/modal.component';
import { ModalAlertComponent } from '../components/modal-alert/modal-alert.component';
import { DataButtons, ModalParams } from '../interfaces/modal';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalService = inject(NgbModal);

  /**
   * Abre un modal simple con los datos dinamicos ingresados.
   * @param content Contenido del cuerpo del modal.
   * @param title Titulo de la cabecera del modal.
   * @param tamanio Tamaño del modal 'sm' | 'lg' | 'xl' | string.
   * @returns Observable<ModalParams> Parametros basicos del cierre del modal.
   */
  openSimpleModal(
    contentTemplate: TemplateRef<any>,
    footerTemplate: TemplateRef<any>,
    title: string = 'Info',
    opciones?: NgbModalOptions
  ): NgbModalRef {
    if (!opciones) opciones = {};
    opciones.backdrop = 'static';
    const modalRef = this.modalService.open(ModalComponent, opciones);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.contentTemplate = contentTemplate;
    modalRef.componentInstance.footerTemplate = footerTemplate;
    return modalRef;
  }

  /**
   * Abre un modal simple usando un iframe para mostrar un archivo.
   * @param iframeUrl URL del archivo o la fuente donde se encuentre el archivo.
   * @param title Titulo de la cabecera del modal.
   * @returns Observable<ModalParams> Parametros basicos del cierre del modal.
   */
  openSimpleModalWithIframe(
    iframeUrl: string,
    title: string = '',
    fileName: string = ''
  ): Observable<ModalParams> {
    return new Observable<ModalParams>((observer) => {
      const modalRef = this.modalService.open(ModalComponent, { size: 'xl' });
      modalRef.componentInstance.title = title;
      modalRef.componentInstance.iframeUrl = iframeUrl;
      modalRef.componentInstance.fileName = fileName;

      modalRef.result.then(
        (result) => {
          observer.next({ resultado: result, razon: null });
          observer.complete();
        },
        (reason) => {
          const razon = this.getDismissReason(reason);
          observer.next({ resultado: null, razon });
          observer.complete();
        }
      );
    });
  }

  /**
   * Abre un modal de alerta.
   * @param tipo Tipo de alerta. Puede ser 'exito', 'informacion', 'advertencia' o 'error'.
   * @param title Titulo de la cabecera del modal.
   * @param content Contenido a mostrar en el body del modal.
   * @param mostrarBotonCancelar boolean para mostrar el boton de cancelar en el modal.
   * @returns Observable<ModalParams> Parametros basicos del cierre del modal.
   */
  openAlertModal(
    tipo: 'exito' | 'informacion' | 'advertencia' | 'error',
    title: string,
    content: any,
    mostrarBotonCancelar: boolean = false,
    dataButtons: DataButtons = {}
  ): Observable<ModalParams> {
    return new Observable<ModalParams>((observer) => {
      const modalRef = this.modalService.open(ModalAlertComponent, {
        backdrop: 'static',
      });
      modalRef.componentInstance.tipoAlerta = tipo;
      modalRef.componentInstance.title = title;
      modalRef.componentInstance.content = content;
      modalRef.componentInstance.mostrarBotonCancelar = mostrarBotonCancelar;
      modalRef.componentInstance.dataButtons = dataButtons;
      modalRef.result.then(
        (result) => {
          observer.next({ resultado: result, razon: null });
          observer.complete();
        },
        (reason) => {
          const razon = this.getDismissReason(reason);
          observer.next({ resultado: null, razon });
          observer.complete();
        }
      );
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  /**
   * Abre un modal de carga sin botones y no permite cerrarse manualmente.
   * @param titulo Título del modal.
   * @param mensaje Mensaje a mostrar mientras carga.
   * @returns NgbModalRef Referencia al modal para poder cerrarlo posteriormente.
   */
  openLoadingModal(
    titulo: string = 'Cargando',
    mensaje: string = 'Por favor, espere...'
  ): NgbModalRef {
    const modalRef = this.modalService.open(ModalAlertComponent, {
      backdrop: 'static', // Evita cerrar haciendo clic en el fondo
      keyboard: false, // Evita cerrar con la tecla ESC
      centered: true, // Centra el modal
    });

    modalRef.componentInstance.tipoAlerta = 'loading'; // Tipo visual del modal
    modalRef.componentInstance.title = titulo;
    modalRef.componentInstance.content = mensaje;
    modalRef.componentInstance.mostrarBotonX = false;
    modalRef.componentInstance.mostrarBotonAceptar = false;
    modalRef.componentInstance.mostrarBotonCancelar = false; // Ocultar botones

    return modalRef; // Devuelve la referencia del modal
  }
}
