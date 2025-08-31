import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '@app/core/interfaces/apiResponse';
import { PrimeNGModules } from '@app/primeng-config';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { VentasService } from '@app/data/services/ventas.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModules, DropdownModule],
  templateUrl: './ventas-detail.component.html',
  styleUrl: './ventas-detail.component.css',
})
export class VentasDetailComponent {
  activos!: any[];
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
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private router: Router,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {
    this.iniciarFormulario();
    if (this.config?.data?.id) {
      this.obtenerRegistro(this.config.data.id);
      this.idVenta = this.config.data.id;
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
      usuario: [''],
      total: [''],
      cambio: [''],
      pago: [''],
      formaPago: [''],
      folio: [''],
      fechaCreacion: [''],
    });
  }

  obtenerRegistro(id: number) {
    this.ventasService.obtenerRegistro(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const datos: any = response.data;

          this.detalleVentas = datos.detalleVentas || [];
          this.totalRecords = this.detalleVentas.length;

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

  imprimirTicket() {
    this.ventasService.obtenerTicket(this.idVenta).subscribe({
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

  cargarDatos(event: TableLazyLoadEvent) {}
}
