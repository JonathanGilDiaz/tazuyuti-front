import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PrimeNGModules } from '@app/primeng-config';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { DEFAULT_VALUES, MODULES_URLS } from '@app/constants/app.constants';
import { DropdownModule } from 'primeng/dropdown';
import { Subject, takeUntil } from 'rxjs';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {
  Bitacora,
  Boleto,
  Corte,
  DetalleRuta,
  Paquete,
  ResumenProducto,
  Venta,
} from '@app/core/interfaces/apiResponse';
import { CorteService } from '@app/data/services/corte.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VentasDetailComponent } from '@app/pages/ventas/features/ventas-detail/ventas-detail.component';
import { TaquillaDetailComponent } from '@app/pages/taquilla/features/taquilla-detail/taquilla-detail.component';
import { PaquetesDetailComponent } from '@app/pages/paquetes/features/paquetes-detail/paquetes-detail.component';
import { BitacoraDetailComponent } from '@app/pages/bitacora/features/bitacora-detail/bitacora-detail.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  providers: [DialogService],
  imports: [CommonModule, PrimeNGModules, DropdownModule],
  templateUrl: './corte-view.component.html',
  styleUrl: './corte-view.component.css',
})
export class CorteViewComponent {
  boletos: Boleto[] = [];
  paquetes: Paquete[] = [];
  ventas: Venta[] = [];
  bitacoras: Bitacora[] = [];
  resumenProductos: ResumenProducto[] = [];
  corte: Corte;
  totalRecords: number = 0;
  loading: boolean = true;
  urlRegresar: string = MODULES_URLS.PUBLIC.DEFAULT;
  rowsPerPageOptions = [DEFAULT_VALUES.PAGE_SIZE, DEFAULT_VALUES.PAGE_SIZE * 2];
  dataTablesParams: DataTableParams = {
    page: 1,
    size: 50,
  };
  refDialog: DynamicDialogRef | undefined;
  first = 10;
  form: FormGroup;
  destroy$ = new Subject<void>();
  constructor(
    private service: CorteService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
    this.iniciarFormulario();
  }

  ngOnInit(): void {
    this.obtenerDetalleCorte(this.config?.data?.id);
  }

  obtenerDetalleCorte(corteId: number) {
    this.loading = true;

    this.service
      .obtenerDetalleCorte(corteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const data = response.data;
            this.boletos = data.boletos || [];
            this.paquetes = data.paquetes || [];
            this.ventas = data.ventas || [];
            this.bitacoras = data.bitacoras || [];
            this.corte = data.corte;
            this.resumenProductos = response.data.resumenProductos || [];

            this.form.patchValue({
              efectivo: this.corte.efectivo,
              transferencia: this.corte.transferencia,
              tarjeta: this.corte.tarjeta,
              total: this.corte.totalCobros,
              totalBitacoras: this.corte.totalRetiros,
              saldoCaja: this.corte.totalCaja,
              saldoInicial: this.corte.saldoInicial,
              inicio: this.corte.inicio,
              cierre: this.corte.cierre,
              usuario: this.corte.usuario,
              efectivoCaja: this.corte.efectivoCaja,
              retiro: this.corte.retiro,
              folio: this.corte.folio,
            });

            this.dineroRealCaja = this.corte.efectivoCaja;
            this.retiro = this.corte.retiro;
            this.saldoFinal = this.corte.saldoFinal;
            const sobrante = this.corte.sobrante || 0;
            const faltante = this.corte.faltante || 0;

            if (Math.abs(sobrante) >= Math.abs(faltante)) {
              this.faltanteSobrante = sobrante;
            } else {
              this.faltanteSobrante = -Math.abs(faltante); // aseguramos que sea negativo
            }
          }

          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  iniciarFormulario(): void {
    this.form = this.fb.group({
      efectivo: [''],
      transferencia: [''],
      tarjeta: [''],
      total: [''],
      saldoCaja: [''],
      saldoInicial: [''],
      inicio: [''],
      usuario: [''],
      totalBitacoras: [''],
      efectivoCaja: [''],
      retiro: [''],
      cierre: [''],
      folio: [''],
    });
  }

  cargarDatos(event: TableLazyLoadEvent) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  mostrarModalAdicional(component: any, titulo: string, data?: any): void {
    this.refDialog = this.dialogService.open(component, {
      header: titulo,
      width: data?.width ? data.width : '70vw',
      data: data,
      contentStyle: { 'z-index': 1036 },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }

  verVenta(dato: Venta) {
    this.mostrarModalAdicional(VentasDetailComponent, 'Detalle de la venta', {
      id: dato.id,
    });
  }

  dineroRealCaja: number | null = null;
  faltanteSobrante: number | null = null;
  retiro: number | null = null;
  saldoFinal: number = 0;

  verBoleto(dato: Boleto) {
    this.mostrarModalAdicional(TaquillaDetailComponent, 'Detalle del boleto', {
      id: dato.id,
    });
  }

  VerPaquete(dato: Paquete) {
    this.mostrarModalAdicional(PaquetesDetailComponent, 'Detalle del envio', {
      id: dato.id,
    });
  }

  verBitacora(dato: DetalleRuta) {
    this.mostrarModalAdicional(
      BitacoraDetailComponent,
      'Detalle de la bitácora',
      {
        id: dato.id,
      },
    );
  }

  cerrar() {
    this.ref.close();
  }
}
