import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Cliente, Producto } from '@app/core/interfaces/apiResponse';
import { PrimeNGModules } from '@app/primeng-config';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { VentasService } from '@app/data/services/ventas.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClienteService } from '@app/data/services/clientes.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModules, DropdownModule],
  templateUrl: './ventas-factura.component.html',
  styleUrl: './ventas-factura.component.css',
})
export class VentasFacturaComponent {
  detalleVentas: Producto[] = [];
  form: FormGroup;
  idVenta: number;
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
  clienteId: number;
  destroy$ = new Subject<void>();
  clientes: Cliente[] = [];
  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private clienteService: ClienteService,
  ) {
    this.iniciarFormulario();
    if (this.config?.data?.id) {
      this.obtenerRegistro(this.config.data.id);
      this.idVenta = this.config.data.id;
    }
  }

  ngOnInit(): void {
    this.obtenerClientes();

    this.form.get('clienteId')?.valueChanges.subscribe((cliente: Cliente) => {
      if (!cliente) return;
      this.clienteId = cliente.id;
      this.form.patchValue({
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellidoPaterno,
        apellidoMaterno: cliente.apellidoMaterno,
        nombreComercial: cliente.nombreComercial,
        rfc: cliente.rfc,
        sociedad: cliente.sociedad,
        telefono: cliente.telefono,
        regimenFiscal: cliente.regimenFiscal,
        direccion: cliente.direccion,
        codigoPostal: cliente.codigoPostal,
        tipoPersona: cliente.tipoPersona,
      });
    });

    this.form.get('total')?.valueChanges.subscribe((subtotal) => {
      if (!subtotal || subtotal <= 0) {
        this.form.patchValue(
          {
            pago: 0,
            cambio: 0,
          },
          { emitEvent: false },
        );
        return;
      }
      const iva = Number((subtotal * 0.16).toFixed(2));
      const totalFinal = Number((subtotal + iva).toFixed(2));
      this.form.patchValue(
        {
          iva: iva,
          totalFinal: totalFinal,
        },
        { emitEvent: false },
      );
    });
  }

  obtenerClientes() {
    this.clienteService.obtenerTodos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientes = response.data;
          if (this.clienteId) {
            const clienteSeleccionado = this.clientes.find(
              (c) => c.id === this.clienteId,
            );
            if (clienteSeleccionado) {
              this.form.patchValue({
                clienteId: clienteSeleccionado,
              });
            }
          }
        }
      },
    });
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      usuario: [''],
      total: [''],
      formaPago: [''],
      folio: [''],
      fechaCreacion: [''],
      clienteId: [''],
      nombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
      nombreComercial: [''],
      rfc: [''],
      sociedad: [''],
      telefono: [''],
      regimenFiscal: [''],
      direccion: [''],
      codigoPostal: [''],
      tipoPersona: [''],
      iva: [''],
      totalFinal: [''],
    });
  }

  imprimirTicket() {
    const clienteSeleccionado = this.form.get('clienteId')?.value;
    if (!clienteSeleccionado) {
      alert('Debes seleccionar un cliente antes de imprimir el ticket.');
      return;
    }
    this.ventasService
      .obtenerTicketFactura(this.idVenta, this.clienteId)
      .subscribe({
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
                  '',
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

  obtenerRegistro(id: number) {
    this.ventasService.obtenerRegistro(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const datos: any = response.data;

          this.detalleVentas = datos.detalleVentas || [];
          this.totalRecords = this.detalleVentas.length;
          this.clienteId = datos.clienteId;
          this.form.patchValue({
            usuario: datos.usuario,
            total: datos.total,
            cambio: datos.cambio,
            pago: datos.pago,
            formaPago: datos.formaPago,
            folio: datos.folio,
            fechaCreacion: datos.fechaCreacion,
          });

          this.loading = false;
        }
      },
      error: () => {
        this.detalleVentas = [];
        this.loading = false;
      },
    });
  }

  eventoCancelar() {
    this.ref.close();
  }

  pageChange(event) {
    const page = event.first / event.rows + 1;
    this.dataTablesParams.page = page;
  }

  cargarDatos(event: TableLazyLoadEvent) {}
}
