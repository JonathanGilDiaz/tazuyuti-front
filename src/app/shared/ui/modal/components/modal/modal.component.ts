import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
  
})
export class ModalComponent {

  activeModal = inject(NgbActiveModal);
  /** 
   * Titulo de la cabecera del modal.
   * @type {string}
  */
  title: string = '';
  /**
   * Contenido del cuerpo del modal.
   * @type {string | null}
   */
  content: string | null = null;
  /**
   * TemplateRef footer dinamico.
   * @type {TemplateRef}
   */
  footerTemplate : TemplateRef<any>;
  /**
   * URL del archivo o de la fuente del archivo.
   * @type {string | null}
   */
  iframeUrl: string | null = null;
  /**
   * TemplateRef contenido dinamico.
   * @type {TemplateRef}
   */
  contentTemplate: TemplateRef<any>;

  constructor(
    private sanitizer: DomSanitizer
  ){}

  /**
   * Convierte una url en segura.
   * @returns URL segura.
   */
  sanitizerURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl);
  }
  
  /**
   * 
   * @param url Img en base64.
   * @returns True si la url es una imagen.
   */
  isImage(url: string): boolean {
    return url.includes('image') ||  (this.title.includes('.jpg') || this.title.includes('.jpeg') || this.title.includes('.png'));
  }
}
