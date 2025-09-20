import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Boleto, DetalleRuta, Paquete } from '@app/core/interfaces/apiResponse';
import { PrimeNGModules } from '@app/primeng-config';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { BitacoraService } from '@app/data/services/bitacora.service';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModules, DropdownModule],
  templateUrl: './bitacora-detail.component.html',
  styleUrl: './bitacora-detail.component.css',
})
export class BitacoraDetailComponent {
  activos!: any[];
  detalleRuta: DetalleRuta;
  capacidadCamioneta: number;
  boletosSuben: Boleto[] = [];
  boletosContinuan: Boleto[] = [];
  paquetesSuben: Paquete[] = [];
  paquetesContinuan: Paquete[] = [];
  form: FormGroup;
  idDetalleRuta: number;
  loading: boolean = true;
  totalRecords: number = 0;
  dataTablesParams: DataTableParams = {
    page: 1,
    size: 50,
  };
  asientosOcupados = signal<Set<number>>(new Set());
  asientosSeleccionados = signal<number[]>([]);
  trackByNum = (_: number, item: any) => item.num ?? item.texto;

  dataTablesParamsEntrega: DataTableParams = {
    page: 1,
    size: 50,
  };
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bitacoraService: BitacoraService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public modalService: ModalService,
    public authService: AuthService
  ) {
    this.iniciarFormulario();
    if (this.config?.data?.id) {
      this.obtenerRegistro(this.config.data.id);
      this.idDetalleRuta = this.config.data.id;
    }
  }

  ngOnInit(): void {
    this.activos = [
      { etiqueta: 'Si', valor: true },
      { etiqueta: 'No', valor: false },
    ];
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      fechaSalida: [''],
      origen: [''],
      destino: [''],
      horarioSalida: [''],
      cliente: [''],
      asientos: [''],
      usuario: [''],
      total: [''],
      cambio: [''],
      pago: [''],
      formaPago: [''],
      folio: [''],
      fechaCreacion: [''],
      estado: [''],
      operador: [''],
      unidad: [''],
    });
  }

  obtenerRegistro(id: number) {
    this.bitacoraService.obtenerRegistro(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const datos: any = response.data;
          this.detalleRuta = datos.detalleRuta;
          this.boletosSuben = datos.boletosEnviados || [];
          this.boletosContinuan = datos.boletosSiguen || [];
          this.paquetesSuben = datos.paquetesEnviados || [];
          this.paquetesContinuan = datos.paquetesSiguen || [];

          this.capacidadCamioneta =
            datos.detalleRuta.ruta.unidad.tipoCamioneta.capacidad;
          const ocupados = datos.detalleRuta.ocupados
            ? datos.detalleRuta.ocupados
                .split(',')
                .map((x: string) => Number(x.trim()))
                .filter((x: number) => !isNaN(x))
            : [];

          this.asientosOcupados.set(new Set(ocupados)); // ✅ correcto
          this.form.patchValue({
            fechaSalida: datos.detalleRuta.fecha,
            origen: datos.detalleRuta.salida.nombre,
            destino: datos.detalleRuta.llegada.nombre,
            horarioSalida: datos.detalleRuta.salidaHora,
            cliente: datos.cliente,
            asientos: datos.asientos,
            usuario: datos.usuario,
            total: datos.total,
            cambio: datos.cambio,
            pago: datos.pago,
            formaPago: datos.formaPago,
            estado: datos.detalleRuta.estado,
            folio: datos.folio,
            fechaCreacion: datos.fechaCreacion,
            operador: datos.detalleRuta.ruta.unidad.nombre,
            unidad: datos.detalleRuta.ruta.unidad.usuario.nombre,
          });
          console.log(datos.detalleRuta.estado);

          this.loading = false;
        }
      },
      error: () => {
        this.boletosSuben = [];
        this.boletosContinuan = [];
        this.paquetesSuben = [];
        this.paquetesContinuan = [];
        this.loading = false;
      },
    });
  }

  esOcupado(n: number) {
    return this.asientosOcupados().has(n);
  }
  esSeleccionado(n: number) {
    return this.asientosSeleccionados().includes(n);
  }

  eventoCancelar() {
    this.ref.close();
  }

  pageChange(event) {
    const page = event.first / event.rows + 1;
    this.dataTablesParams.page = page;
  }

  layoutAsientos() {
    const cap = this.capacidadCamioneta;

    if (cap === 21) {
      return [
        { tipo: 'chofer', texto: 'CHOFER' },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 20 },
        { tipo: 'asiento', num: 1 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 2 },
        { tipo: 'asiento', num: 3 },
        { tipo: 'etiqueta', texto: 'PANTALLA' },
        { tipo: 'etiqueta', texto: 'ACCESO' },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 4 },
        { tipo: 'asiento', num: 5 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 6 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 7 },
        { tipo: 'asiento', num: 8 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 9 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 10 },
        { tipo: 'asiento', num: 11 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 12 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 13 },
        { tipo: 'asiento', num: 14 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 15 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 16 },
        { tipo: 'asiento', num: 17 },
        { tipo: 'asiento', num: 18 },
        { tipo: 'asiento', num: 19 },
        { tipo: 'linea' },
      ];
    }
    if (cap === 14) {
      return [
        { tipo: 'chofer', texto: 'CHOFER' },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 14 },
        { tipo: 'asiento', num: 1 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 2 },
        { tipo: 'asiento', num: 3 },
        { tipo: 'espacio' },
        { tipo: 'etiqueta', texto: 'ACCESO' },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 4 },
        { tipo: 'asiento', num: 5 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 6 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 7 },
        { tipo: 'asiento', num: 8 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 9 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 10 },
        { tipo: 'asiento', num: 11 },
        { tipo: 'asiento', num: 12 },
        { tipo: 'asiento', num: 13 },
        { tipo: 'linea' },
      ];
    }

    return [];
  }

  imprimirTicket() {
    /*
    this.boletoService.obtenerTicket(this.idVenta).subscribe({
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
    });*/
  }

  cargarDatos(event: TableLazyLoadEvent) {}

  cerrar() {
    this.ref.close();
  }

  CerrarBitacora() {
    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de cancelar este bolto?',
        true
      )
      .subscribe({
        next: (resp) => {
          if (resp.resultado) {
            const bitacoraDatos = {
              usuario: { id: this.authService.getUsuario()?.id },
              detalleRuta: { id: this.idDetalleRuta } 
            };
            this.bitacoraService.cerrarBitacora(bitacoraDatos).subscribe({
              next: (r) => {
                if (r.success) {
                  this.modalService
                    .openAlertModal(
                      'exito',
                      'Éxito',
                      r.message || 'Boleto cancelado'
                    )
                    .subscribe(() => this.ref.close(true));
                }
              },
            });
          }
        },
      });
  }
}
