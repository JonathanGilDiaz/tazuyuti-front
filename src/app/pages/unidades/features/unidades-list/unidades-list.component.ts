import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PrimeNGModules } from '@app/primeng-config';
import { Router, RouterLink } from '@angular/router';
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
import { UnidadesAddComponent } from '../unidades-add/unidades-add.component';
import { AuthService } from '@app/core/services/auth.service';
import { UnidadesEditComponent } from '../unidades-edit/unidades-edit.component';
import { UnidadesService } from '@app/data/services/unidades.service';
import { Unidad } from '@app/core/interfaces/apiResponse';

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
  templateUrl: './unidades-list.component.html',
  styleUrl: './unidades-list.component.css',
})
export class UnidadesListComponent {
  datos: Unidad[] = [];
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
    private service: UnidadesService,
    private modalService: ModalService,
    private router: Router,
    private datatableService: DatatableService,
    private dialogService: DialogService,
    private authService: AuthService
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

  eliminar(dato: Unidad) {
    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de eliminar el registro?',
        true
      )
      .subscribe({
        next: (response) => {
          this.loading = true;
          if (response.resultado) {
            this.service.eliminarRegistro(dato.id).subscribe({
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
          }
          this.loading = false;
        },
      });
  }

  editar(dato: Unidad) {
    this.mostrarModalAdicional(UnidadesEditComponent, 'Editar Unidad', {
      dato,
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

  agregar() {
    this.mostrarModalAdicional(UnidadesAddComponent, 'Registrar Nueva unidad');
    this.refDialog.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado: boolean) => {
        if (resultado) {
          this.obtenerDatos(this.dataTablesParams);
        }
      });
  }
}
