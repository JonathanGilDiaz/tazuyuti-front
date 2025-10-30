import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PrimeNGModules } from '@app/primeng-config';
import { RouterLink } from '@angular/router';
import {
  PrecioBoleto,
  PrecioPaqueteria,
} from '@app/core/interfaces/apiResponse';
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
import { preciosPaqueteriaService } from '@app/data/services/preciosPaqueteria.service';
import { PreciosBoletosService } from '@app/data/services/preciosBoletos.service';
import { PasajesEditComponent } from '../pasajes-edit/pasajes-edit.component';
import { PasajesAddComponent } from '../pasajes-add/pasajes-add.component';

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
  templateUrl: './pasajes-list.component.html',
  styleUrl: './pasajes-list.component.css',
})
export class PasajesListComponent {
  datos: PrecioBoleto[] = [];
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
    private service: PreciosBoletosService,
    private modalService: ModalService,
    private datatableService: DatatableService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {}

  obtenerDatos(dataTablesParams: DataTableParams) {
    this.service
      .obtenerRegistros(dataTablesParams)
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

  eliminar(producto: PrecioPaqueteria) {
    this.loading = true;
    this.service.eliminarRegistro(producto.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loading = false;
          this.datos = [];
          this.obtenerDatos(this.dataTablesParams);
        } else {
          this.loading = false;
          if (!response.data?.description?.includes('expirado')) {
            this.modalService
              .openAlertModal('error', 'Error', response.message)
              .subscribe();
          }
        }
      },
      error: (err: GlobalError) => {
        this.loading = false;
        this.modalService
          .openAlertModal('error', 'Error', err.error.message)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      },
    });

    this.loading = false;
  }

  editar(precio: PrecioBoleto) {
    this.mostrarModalAdicional(PasajesEditComponent, 'Editar precio', {
      precio,
    });

    this.refDialog?.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado: boolean) => {
        if (resultado) {
          this.obtenerDatos(this.dataTablesParams);
        }
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

  agregarProducto() {
    this.mostrarModalAdicional(PasajesAddComponent, 'Registrar nuevo precio');
    this.refDialog.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado: boolean) => {
        if (resultado) {
          this.obtenerDatos(this.dataTablesParams);
        }
      });
  }
}
