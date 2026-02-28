import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PrimeNGModules } from '@app/primeng-config';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { DEFAULT_VALUES, MODULES_URLS } from '@app/constants/app.constants';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { LayoutComponent } from '@app/shared/ui/layout/layout.component';
import { DropdownModule } from 'primeng/dropdown';
import { Subject, takeUntil } from 'rxjs';
import { GlobalError } from '@app/core/interfaces/errors.interface';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '@app/core/services/auth.service';
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
  imports: [CommonModule, LayoutComponent, PrimeNGModules, DropdownModule],
  templateUrl: './corte-detail.component.html',
  styleUrl: './corte-detail.component.css',
})
export class CorteDetailComponent {
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
    private modalService: ModalService,
    private dialogService: DialogService,
    public authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.iniciarFormulario();
    this.obtenerRegistro();
  }

  ngOnInit(): void {}

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
    });
  }

  obtenerRegistro() {
    this.service
      .obtenerRegistro(this.authService.getUsuario()?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.boletos = response.data.boletos;
            this.paquetes = response.data.paquetes;
            this.ventas = response.data.ventas;
            this.bitacoras = response.data.bitacoras;
            this.corte = response.data.corte;
            this.resumenProductos = response.data.resumenProductos || [];
            const datos: any = response.data;
            this.form.patchValue({
              efectivo: datos.totales.efectivo,
              transferencia: datos.totales.transferencia,
              tarjeta: datos.totales.tarjeta,
              total: datos.totales.total,
              totalBitacoras: datos.totales.totalBitacoras,
              saldoCaja: datos.totales.saldoCaja,
              saldoInicial: datos.corte.saldoInicial,
              inicio: datos.corte.inicio,
              usuario: this.authService.getUsuario(),
            });

            this.totalRecords = response.data.totalElements || 0;

            this.loading = false;
          } else {
            this.loading = false;
          }
        },
        error: (err: GlobalError) => {
          this.loading = false;
        },
      });
  }

  pageChange(event) {
    const page = event.first / event.rows + 1;
    this.dataTablesParams.page = page;
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

  calcularFaltanteSobrante() {
    const saldoCalculado = this.form.get('saldoCaja')?.value || 0;
    if (this.dineroRealCaja !== null) {
      this.faltanteSobrante = this.dineroRealCaja - saldoCalculado;
      this.calcularSaldoFinal();
    }
  }

  calcularSaldoFinal() {
    if (this.dineroRealCaja !== null) {
      const retiro = this.retiro || 0;
      if (retiro > this.dineroRealCaja) {
        this.saldoFinal = 0;
        return;
      }
      this.saldoFinal = this.dineroRealCaja - retiro;
    }
  }

  puedeCerrarCorte(): boolean {
    if (this.dineroRealCaja === null) return false;
    if (this.retiro === null) return false;
    if (this.retiro > this.dineroRealCaja) return false;
    return true;
  }

  confirmarCerrarCorte() {
    if (!this.corte?.id) return;
    const dineroReal = this.dineroRealCaja || 0;
    const retiro = this.retiro || 0;
    if (this.dineroRealCaja === null) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Debes ingresar el dinero real en caja.',
        )
        .subscribe();
      return;
    }
    if (retiro > dineroReal) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'El retiro no puede ser mayor al dinero real en caja.',
        )
        .subscribe();
      return;
    }
    const cortePayload: Corte = {
      ...this.corte,
      efectivo: this.form.get('efectivo')?.value,
      transferencia: this.form.get('transferencia')?.value,
      tarjeta: this.form.get('tarjeta')?.value,
      totalCaja: this.form.get('saldoCaja')?.value,
      saldoFinal: this.saldoFinal,
      totalRetiros: this.form.get('totalBitacoras')?.value,
      retiro: retiro,
      faltante:
        this.faltanteSobrante! < 0 ? Math.abs(this.faltanteSobrante!) : 0,
      sobrante: this.faltanteSobrante! > 0 ? this.faltanteSobrante! : 0,
      efectivoCaja: dineroReal,
      totalCobros:
        this.ventas.reduce((sum, v) => sum + v.total, 0) +
        this.boletos.reduce((sum, b) => sum + b.total, 0) +
        this.paquetes.reduce((sum, p) => sum + p.total, 0),
    };
    this.service.cerrarCorte(cortePayload).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.logout();
        }
      },
    });
  }

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
}
