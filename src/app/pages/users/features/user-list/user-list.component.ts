import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PrimeNGModules } from '@app/primeng-config';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '@app/core/interfaces/apiResponse';
import { UsuariosService } from '@app/data/services/usuarios.service';
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
import { UserTransferenciaComponent } from '../user-transferencia/user-transferencia.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    PrimeNGModules,
    RouterLink,
    DropdownModule,
  ],
  providers: [DialogService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  activos!: any[];
  usuarios: Usuario[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  urlRegresar: string = MODULES_URLS.PUBLIC.DEFAULT;
  rowsPerPageOptions = [DEFAULT_VALUES.PAGE_SIZE, DEFAULT_VALUES.PAGE_SIZE * 2];
  dataTablesParams: DataTableParams = {
    page: 1,
    size: 50,
  };
  first = 10;
  destroy$ = new Subject<void>();
  refDialog: DynamicDialogRef | undefined;

  constructor(
    private usuariosService: UsuariosService,
    private modalService: ModalService,
    private router: Router,
    private datatableService: DatatableService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.activos = [
      { etiqueta: 'Activo', valor: true },
      { etiqueta: 'Inactivo', valor: false },
    ];
  }

  obtenerUsuarios(dataTablesParams: DataTableParams) {
    this.usuariosService
      .obtenerRegistros(dataTablesParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (response.data && response.data.content) {
              this.usuarios = response.data.content;
              this.totalRecords = response.data.totalElements;
            } else this.usuarios = [];
            this.loading = false;
          } else {
            this.modalService
              .openAlertModal('error', 'Error', response.message)
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          }
        },
        error: (err: GlobalError) => {
          this.modalService
            .openAlertModal('error', 'Error', err.error.message)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        },
      });
  }

  pageChange(event) {
    const page = event.first / event.rows + 1;
    this.dataTablesParams.page = page;
  }
  cargarUsuarios(event: TableLazyLoadEvent) {
    const page = event.first / event.rows + 1; // Calcular la página actual
    const size = event.rows; // Tamaño de la página

    // Procesa los filtros y el ordenamiento utilizando los métodos del servicio
    const filters = this.datatableService.procesarFiltros(event);
    const sort = this.datatableService.procesarOrdenamiento(event);

    this.dataTablesParams = {
      size: size,
      page: page,
      sort: sort,
      filters: filters,
    };
    this.obtenerUsuarios(this.dataTablesParams);
  }

  ver(usuario: Usuario) {
    this.router.navigate(['usuarios', usuario.id]);
  }

  editar(usuario: Usuario) {
    this.router.navigate(['usuarios/editar', usuario.id]);
  }

  deshabilitar(usuario: Usuario) {
    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        `Está apunto de deshabilitar el usuario ${usuario.usuario}. ¿Está seguro de continuar?`,
        true,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.resultado) {
            usuario.activo = false;
            this.usuariosService
              .activarUsuario(usuario)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    this.obtenerUsuarios(this.dataTablesParams);
                  } else {
                    this.modalService
                      .openAlertModal('error', 'Error', response.message)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe();
                  }
                },
                error: (err: GlobalError) => {
                  this.modalService
                    .openAlertModal('error', 'Error', err.error.message)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe();
                },
              });
          }
        },
      });
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

  verBoletosPorTransferencia(dato: Usuario) {
    this.mostrarModalAdicional(
      UserTransferenciaComponent,
      'Boletos por transferencia',
      {
        id: dato.id,
      },
    );
    this.refDialog.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado: any) => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
