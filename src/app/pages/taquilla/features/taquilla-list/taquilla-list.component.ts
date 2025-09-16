import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PrimeNGModules } from '@app/primeng-config';
import { RouterLink } from '@angular/router';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { DEFAULT_VALUES, MODULES_URLS } from '@app/constants/app.constants';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { LayoutComponent } from '@app/shared/ui/layout/layout.component';
import { DropdownModule } from 'primeng/dropdown';
import { DatatableService } from '@app/shared/ui/datatables/services/datatable.service';
import { Subject, takeUntil } from 'rxjs';
import { GlobalError } from '@app/core/interfaces/errors.interface';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '@app/core/services/auth.service';
import { Boleto, Venta } from '@app/core/interfaces/apiResponse';
import { BoletosService } from '@app/data/services/boletos.service';
import { TaquillaAddComponent } from '../taquilla-add/taquilla-add.component';
import { TaquillaDetailComponent } from '../taquilla-detail/taquilla-detail.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  providers: [DialogService],
  imports: [
    CommonModule,
    LayoutComponent,
    PrimeNGModules,
    RouterLink,
    DropdownModule,
  ],
  templateUrl: './taquilla-list.component.html',
  styleUrl: './taquilla-list.component.css',
})
export class TaquillaListComponent {
  datos: Boleto[] = [];
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
  destroy$ = new Subject<void>();
  constructor(
    private service: BoletosService,
    private modalService: ModalService,
    private datatableService: DatatableService,
    private dialogService: DialogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  obtenerDatos(dataTablesParams: DataTableParams) {
    this.service
      .obtenerRegistros(this.authService.getUsuario()?.id, dataTablesParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (response.data && response.data.content) {
              this.datos = response.data.content;
              this.totalRecords = response.data.totalElements;
            } else this.datos = [];
            this.loading = false;
          } else {
            this.modalService
              .openAlertModal('error', 'Error', response.message)
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          }
        },
        error: (err: GlobalError) => {
          this.datos = [];
          this.loading = false;
        },
      });
  }

  pageChange(event) {
    const page = event.first / event.rows + 1;
    this.dataTablesParams.page = page;
  }

  cargarDatos(event: TableLazyLoadEvent) {
    const page = event.first / event.rows + 1;
    const size = event.rows;
    const filters = this.datatableService.procesarFiltros(event);
    const sort = this.datatableService.procesarOrdenamiento(event);

    this.dataTablesParams = {
      size: size,
      page: page,
      sort: sort,
      filters: filters,
    };
    this.obtenerDatos(this.dataTablesParams);
  }

  ver(dato: Boleto) {
    this.mostrarModalAdicional(TaquillaDetailComponent, 'Detalle de la venta', {
      id: dato.id,
    });
  }

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

  agregar() {
    this.mostrarModalAdicional(TaquillaAddComponent, 'Registrar nuevo boleto');
    this.refDialog.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado: any) => {
        this.obtenerDatos(this.dataTablesParams);
        /*
        if (resultado && resultado.idVenta) {
          this.obtenerDatos(this.dataTablesParams);
          this.service.obtenerTicket(resultado.idVenta).subscribe({
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

                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
              } else {
                console.error('No se pudo generar el ticket');
              }
            },
            error: (err) => {
              console.error('Error obteniendo el ticket:', err);
            },
          });
        }*/
      });
  }
}
