import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Cliente, Producto, Venta } from '@app/core/interfaces/apiResponse';
import { PrimeNGModules } from '@app/primeng-config';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { VentasService } from '@app/data/services/ventas.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UsuariosService } from '@app/data/services/usuarios.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModules, DropdownModule],
  templateUrl: './user-transferencia.component.html',
  styleUrl: './user-transferencia.component.css',
})
export class UserTransferenciaComponent {
  form: FormGroup;
  loading: boolean = true;
  totalRecords: number = 0;
  dataTablesParams: DataTableParams = {
    page: 1,
    size: 50,
  };
  userId: number;
  destroy$ = new Subject<void>();
  ventas: Venta[] = [];
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
    this.iniciarFormulario();
    if (this.config?.data?.id) {
      this.obtenerRegistro(this.config.data.id);
    }
  }

  private obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  obtenerRegistro(id: number) {
    const fechaInicio = this.form.get('fechaInicio')?.value;
    const fechaFin = this.form.get('fechaFin')?.value;
    this.loading = true;
    this.usuarioService
      .detailTransferencias(id, fechaInicio, fechaFin)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const data = response.data;
            this.ventas = data.boletos || [];
            this.totalRecords = data.cantidad || 0;
            this.form.patchValue({
              usuario: data.usuario,
              unidad: data.unidad,
              total: data.totalGeneral,
            });
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  ngOnInit(): void {}

  iniciarFormulario(): void {
    const hoy = this.obtenerFechaHoy();
    this.form = this.fb.group({
      usuario: [null],
      unidad: [null],
      total: [0],
      fechaInicio: [hoy],
      fechaFin: [hoy],
    });
  }

  buscar() {
    this.obtenerRegistro(this.config.data.id);
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
