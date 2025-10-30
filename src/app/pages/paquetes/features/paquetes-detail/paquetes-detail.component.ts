import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DetallePaquete, Producto } from '@app/core/interfaces/apiResponse';
import { PrimeNGModules } from '@app/primeng-config';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaquetesService } from '@app/data/services/paquetes.service';
import { RutasService } from '@app/data/services/rutas.service';
import { AuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModules, DropdownModule],
  templateUrl: './paquetes-detail.component.html',
  styleUrl: './paquetes-detail.component.css',
})
export class PaquetesDetailComponent {
  detallePaquete: DetallePaquete[] = [];
  form: FormGroup;
  rutasDisponibles: any[] = [];
  mostrarFormularioEnvio = false;
  mostrarFormularioRecibir = false;
  mostrarFormularioEntregar = false;
  mostrarFormularioCancelacion = false;
  idPaquete: number;
  loading: boolean = true;
  totalRecords: number = 0;
  dataTablesParams: DataTableParams = {
    page: 1,
    size: 50,
  };

  dataTablesParamsEntrega: DataTableParams = {
    page: 1,
    size: 50,
  };
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private paqueteService: PaquetesService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public rutaService: RutasService,
    public authService: AuthService,
    private modalService: ModalService
  ) {
    this.form = this.fb.group({
      remitente: [''],
      destinatario: [''],
      folio: [''],
      fechaCreacion: [''],
      destino: [null],
      estado: [null],
      formaPago: [''],
      total: [0],
      pago: [0],
      cambio: [0],
      rutaId: [null],
      ruta: [''],
      envio: [null],
      observacionesRecibir: [''],
      observacionesEntregar: [''],
      recibo: [''],
      entrega: [''],
      cancelacion: [''],
      descripcionCancelacion: [''],
      observacionesEntrega: [''],
      recibio: [''], // <- este es obligatorio porque lo usas en "Entregar Paquete"
    });

    if (this.config?.data?.id) {
      this.obtenerRegistro(this.config.data.id);
    }
  }

  ngOnInit(): void {}
  obtenerRegistro(id: number) {
    this.paqueteService.obtenerRegistro(id).subscribe({
      next: (res) => {
        if (res.success) {
          const datos = res.data;
          this.detallePaquete = datos.detallePaquete || [];
          this.totalRecords = this.detallePaquete.length;

          this.form.patchValue(datos);

          this.rutaService.obtenerRutasDisponibles(datos.id).subscribe((r) => {
            this.rutasDisponibles = r.data;
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
  enviarPaquete() {
    const rutaSeleccionada = this.form.get('ruta')?.value;

    if (!rutaSeleccionada) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Debes seleccionar una ruta antes de enviar el paquete.'
        )
        .subscribe();
      return;
    }

    const payload = {
      paquete: { id: this.config.data.id },
      usuario: { id: this.authService.getUsuario()?.id },
      unidad: { id: rutaSeleccionada.ruta.unidad.id },
      detalleRuta: { id: rutaSeleccionada.id },
    };

    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de enviar este paquete?',
        true
      )
      .subscribe({
        next: (resp) => {
          if (resp.resultado) {
            this.paqueteService.enviarPaquete(payload).subscribe({
              next: (r) => {
                if (r.success) {
                  this.ref.close(true);
                } else {
                  this.modalService
                    .openAlertModal(
                      'error',
                      'Error',
                      r.message || 'No se pudo enviar el paquete.'
                    )
                    .subscribe();
                }
              },
              error: (err) => {
                console.error('Error al enviar paquete', err);
                this.modalService
                  .openAlertModal(
                    'error',
                    'Error',
                    'Ocurrió un problema al enviar el paquete.'
                  )
                  .subscribe();
              },
            });
          }
        },
      });
  }

  eventoCancelar() {
    this.ref.close();
  }

  recibirPaquete() {
    const observaciones = this.form.get('observacionesRecibir')?.value || null;

    const payload = {
      paquete: { id: this.config.data.id },
      usuario: { id: this.authService.getUsuario()?.id },
      observaciones,
    };

    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de recibir este paquete?',
        true
      )
      .subscribe({
        next: (resp) => {
          if (resp.resultado) {
            this.paqueteService.recibirPaquete(payload).subscribe({
              next: (r) => {
                if (r.success) {
                  this.modalService
                    .openAlertModal(
                      'exito',
                      'Éxito',
                      r.message || 'Paquete recibido'
                    )
                    .subscribe(() => this.ref.close(true));
                }
              },
            });
          }
        },
      });
  }

  entregarPaquete() {
    const observaciones = this.form.get('observacionesEntregar')?.value || null;
    const recibio = this.form.get('recibio')?.value;

    if (!recibio) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Debe especificar quién recibió el paquete'
        )
        .subscribe();
      return;
    }

    const payload = {
      paquete: { id: this.config.data.id },
      usuario: { id: this.authService.getUsuario()?.id },
      observaciones,
      recibio,
    };

    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de entregar este paquete?',
        true
      )
      .subscribe({
        next: (resp) => {
          if (resp.resultado) {
            this.paqueteService.entregarPaquete(payload).subscribe({
              next: (r) => {
                if (r.success) {
                  this.modalService
                    .openAlertModal(
                      'exito',
                      'Éxito',
                      r.message || 'Paquete entregado'
                    )
                    .subscribe(() => this.ref.close(true));
                }
              },
            });
          }
        },
      });
  }

  cancelarPaquete() {
    const descripcion = this.form.get('descripcionCancelacion')?.value;

    if (!descripcion) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Debe ingresar la descripción de la cancelación'
        )
        .subscribe();
      return;
    }

    const payload = {
      paquete: { id: this.config.data.id },
      usuario: { id: this.authService.getUsuario()?.id },
      descripcion,
    };

    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de cancelar este paquete?',
        true
      )
      .subscribe({
        next: (resp) => {
          if (resp.resultado) {
            this.paqueteService.cancelarPaquete(payload).subscribe({
              next: (r) => {
                if (r.success) {
                  this.modalService
                    .openAlertModal(
                      'exito',
                      'Éxito',
                      r.message || 'Paquete cancelado'
                    )
                    .subscribe(() => this.ref.close(true));
                }
              },
            });
          }
        },
      });
  }

  pageChange(event) {
    const page = event.first / event.rows + 1;
    this.dataTablesParams.page = page;
  }

  cargarDatos(event: TableLazyLoadEvent) {}

  imprimirTicketCliente() {
    this.paqueteService.obtenerTicketCliente(this.config.data.id).subscribe({
      next: (response) => {
        if (response.success && response.data?.archivo) {
          let base64Data: string = '';
          if (typeof response.data.archivo === 'object') {
            base64Data = response.data.archivo.base64Content || '';
          } else if (typeof response.data.archivo === 'string') {
            base64Data = response.data.archivo;
            if (base64Data.startsWith('data:application/pdf')) {
              base64Data = base64Data.replace(
                /^data:application\/pdf;base64,/,
                ''
              );
            }
          }
          try {
            if (!base64Data) throw new Error('Base64 vacío');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
          } catch (error) {
            console.error('Error al decodificar Base64:', error);
          }
        } else {
          console.error('No se pudo generar el ticket');
        }
      },
      error: (err) => {
        console.error('Error obteniendo el ticket:', err);
      },
    });
  }

  imprimirTicketInterno() {
    this.paqueteService.obtenerTicketInterno(this.config.data.id).subscribe({
      next: (response) => {
        if (response.success && response.data?.archivo) {
          let base64Data: string = '';
          if (typeof response.data.archivo === 'object') {
            base64Data = response.data.archivo.base64Content || '';
          } else if (typeof response.data.archivo === 'string') {
            base64Data = response.data.archivo;
            if (base64Data.startsWith('data:application/pdf')) {
              base64Data = base64Data.replace(
                /^data:application\/pdf;base64,/,
                ''
              );
            }
          }
          try {
            if (!base64Data) throw new Error('Base64 vacío');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
          } catch (error) {
            console.error('Error al decodificar Base64:', error);
          }
        } else {
          console.error('No se pudo generar el ticket');
        }
      },
      error: (err) => {
        console.error('Error obteniendo el ticket:', err);
      },
    });
  }
}
