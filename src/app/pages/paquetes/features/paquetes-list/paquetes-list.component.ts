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
import { Paquete } from '@app/core/interfaces/apiResponse';
import { PaquetesService } from '@app/data/services/paquetes.service';
import { PaquetesDetailComponent } from '../paquetes-detail/paquetes-detail.component';
import { PaquetesAddComponent } from '../paquetes-add/paquetes-add.component';

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
  templateUrl: './paquetes-list.component.html',
  styleUrl: './paquetes-list.component.css',
})
export class PaquetesListComponent {
  datos: Paquete[] = [];
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
    private service: PaquetesService,
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

  ver(dato: Paquete) {
    this.mostrarModalAdicional(PaquetesDetailComponent, 'Detalle del envio', {
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
    this.mostrarModalAdicional(PaquetesAddComponent, 'Registrar nuevo envio');
    this.refDialog.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado: any) => {
        if (resultado && resultado.idPaquete) {
          this.obtenerDatos(this.dataTablesParams);
        }
      });
  }
}
