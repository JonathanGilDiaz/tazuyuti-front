import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DEFAULT_VALUES_fILES } from '@app/constants/app.constants';
import { FileBeforeUploadEvent, FileSelectEvent, FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ModalService } from '../modal/services/modal.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {

  @Input() accept : string =  'application/pdf';
  @Input() fileLimit : number =  2;
  @Input() multiple : boolean =  true;
  @Input() titulo : string =  'Documentos';
  @Input() nombreBotonCargarArchivo : string =  'Elegir';
  @Input() nombreBotonSubirArchivo : string =  'Subir';
  @Input() nombreBotonCancelar : string =  'Cancelar';
  @Output() archivosSubidos : EventEmitter<File[]> = new EventEmitter<File[]>();
  fileUrl: string | null = null;
  archivos: File[] = [];
  valoresPorDefectoArchivos = DEFAULT_VALUES_fILES;
  destroy$ = new Subject<void>();

  constructor(
    private modalService: ModalService,
  ){}

  /**
   * Permite guardar archivos en PDF en el servidor.
   * @param event Información obtenida del modulo de FileUpload
   */
  subirArchivos(event : FileUploadEvent) : void {
    this.archivosSubidos.emit(this.archivos);
  }

  uploadEvent(callback) {
    this.archivosSubidos.emit(this.archivos);
    callback();
  }

  onRemoveTemplatingFile(event, file, removeFileCallback, index) {
    removeFileCallback(event, index);
  }

  choose(event, callback) {
    callback();
}

  onBeforeUpload(event : FileSelectEvent, fileUpload) : void {
    let  archivos = event.currentFiles;
    if(archivos.length > this.fileLimit) {
      this.modalService.openAlertModal('error', 'Se ha excedido el número máximo de archivos.', 'El límite es de 2 archivos como máximo.').pipe(takeUntil(this.destroy$)).subscribe();
      fileUpload.clear();
    } else {
      let contieneArchivoMayorLimitePermitido : boolean = archivos.some(archivo => archivo.size > this.valoresPorDefectoArchivos.MAX_FILE_SIZE);
      let archivosMayoresAlLimitePermitido  = archivos.filter(archivo => archivo.size > this.valoresPorDefectoArchivos.MAX_FILE_SIZE);
      if(contieneArchivoMayorLimitePermitido){
        this.modalService.openAlertModal('error', this.valoresPorDefectoArchivos.INVALID_FILE_SIZE_MESSAGE_SUMMARY, this.valoresPorDefectoArchivos.INVALID_FILE_SIZE_MESSAGE_DETAIL).pipe(takeUntil(this.destroy$)).subscribe();
        archivosMayoresAlLimitePermitido.forEach((archivoError, index) => {
          let indexDocumento = archivos.findIndex(archivo => archivo.name === archivoError.name)
          fileUpload.remove(event.originalEvent,indexDocumento)
        });
      }
      this.archivos = archivos;
    }
  }

  /**
   * Permite convertir los bytes de un archivo a una cadena
   * de MB para mostrar visualmente.
   * @param bytes Tamaño del archivo por defecto es bytes
   * @returns Cadena trasformada a MB.
   */
  bytesToMB(bytes: number): string {
    const bytesPerMB = 1024 * 1024; // 1 MB = 1024 * 1024 bytes
    if(bytes<bytesPerMB){
      return bytes+' Bytes'; 
    }
    return (bytes / bytesPerMB).toFixed(2) + ' MB';
  }

  /**
   * Muestra un modal con el archivo recibido.
   * @param archivo Archivo(File o Img).
   */
  mostrarDocumento(archivo: File): void {
    let documento : File = archivo;
    this.fileUrl = URL.createObjectURL(documento);
    this.modalService.openSimpleModalWithIframe(this.fileUrl).pipe(takeUntil(this.destroy$)).subscribe();
  }

  onClear(event) : void {
    this.archivos = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
