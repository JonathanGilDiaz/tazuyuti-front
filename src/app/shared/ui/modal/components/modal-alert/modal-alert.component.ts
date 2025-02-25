import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleExclamation, faInfoCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import { DataButtons } from '../../interfaces/modal';
@Component({
  selector: 'app-modal-alert',
  standalone: true,
  imports: [CommonModule,FontAwesomeModule],
  templateUrl: './modal-alert.component.html',
  styleUrl: './modal-alert.component.css'
})
export class ModalAlertComponent {

  /** 
   * Titulo de la cabecera del modal.
   * @type {string}
  */
  title: string = '';
  /**
   * Contenido del cuerpo del modal.
   * @type {string | null}
   */
  content: any | null = null;
  /**
   * Tipo de alerta a mostrar.
   * @type {string}
   */
  tipoAlerta : string;
  /**
   * Boolean para mostrar el boton cancelar por defecto es false,
   * por lo que no se muestra el boton hasta que sea verdadero
   * @type {boolean}
   */
  mostrarBotonAceptar : boolean = true;
  mostrarBotonX : boolean = true;
  mostrarBotonCancelar : boolean = false;
  faExclamation = faCircleExclamation;
  faCircleCheck = faCircleCheck;
  faTimes = faTimesCircle;
  faInfo = faInfoCircle;
  activeModal = inject(NgbActiveModal);

  dataButtons: DataButtons = {};

  esArreglo(valor : any): boolean{
    return Array.isArray(valor);
  }
}
