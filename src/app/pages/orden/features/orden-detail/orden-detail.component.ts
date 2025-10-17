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
  templateUrl: './orden-detail.component.html',
  styleUrl: './orden-detail.component.css',
})
export class OrdenDetailComponent {
  activos!: any[];
  detalleOrdenCompras: Producto[] = [];
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
      fechaCreacion: [''],
    });
  }

  obtenerRegistro(id: number) {
    this.ventasService.ordenObtenerRegistro(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const datos: any = response.data;

          this.detalleOrdenCompras = datos.detalleOrdenCompras || [];
          this.totalRecords = this.detalleOrdenCompras.length;

          this.form.patchValue({
            usuario: datos.usuario,
            total: datos.total,
            fechaCreacion: datos.fechaCreacion,
          });

          this.loading = false;
        }
      },
      error: () => {
        this.detalleOrdenCompras = [];
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
