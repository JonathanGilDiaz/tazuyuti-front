import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { PrimeNGModules } from '@app/primeng-config';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableLazyLoadEvent } from 'primeng/table';
import { AuthService } from '@app/core/services/auth.service';
import { PaquetesService } from '@app/data/services/paquetes.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, PrimeNGModules, ReactiveFormsModule, DropdownModule],
  providers: [DialogService],
  templateUrl: './paquetes-add.component.html',
  styleUrls: ['./paquetes-add.component.css'],
})
export class PaquetesAddComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();
  sucursales: any[] = [];
  sucursalesFiltradas: any[] = [];
  refDialog: DynamicDialogRef | undefined;
  detallePaquete: Array<{
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
  }> = [];

  total = 0;
  cambio = 0;
  totalRecords = 0;
  private contadorConceptos = 1;
  baseOrigenId: number | null = null;
  baseOrigenNombre = '';

  constructor(
    private fb: FormBuilder,
    private paqueteService: PaquetesService,
    private modalService: ModalService,
    private authService: AuthService,
    public ref: DynamicDialogRef,
  ) {
    this.iniciarFormulario();
  }

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    this.baseOrigenId = usuario?.sucursal?.id ?? null;
    this.baseOrigenNombre = usuario?.sucursal?.nombre ?? '';
    this.paqueteService
      .catalogos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          if (resp.success) {
            this.sucursales = resp.data.sucursal || [];
            this.sucursalesFiltradas = this.sucursales.filter(
              (s: any) => s.id !== this.baseOrigenId,
            );
          }
        },
      });

    this.form
      .get('pago')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calcularTotal());
    this.form
      .get('formaPago')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calcularTotal());
  }

  trackBySuc = (_: number, s: any) => s.id;

  iniciarFormulario(): void {
    this.form = this.fb.group({
      remitente: ['', [Validators.required, Validators.minLength(2)]],
      destinatario: ['', [Validators.required, Validators.minLength(2)]],
      baseDestinoId: [null, [Validators.required]],

      conceptoAgregar: [''],
      precioAgregar: [0],
      cantidadAgregar: [1],

      formaPago: ['01 Efectivo', Validators.required],
      pago: [0],

      total: [0],
    });
  }

  agregarSeleccion(): void {
    const concepto = this.form.get('conceptoAgregar')?.value?.trim();
    const precio = Number(this.form.get('precioAgregar')?.value);
    const cantidad = Number(this.form.get('cantidadAgregar')?.value);
    if (!concepto) {
      this.modalService
        .openAlertModal('error', 'Error', 'Debe ingresar un concepto.')
        .subscribe();
      return;
    }
    if (!precio || precio <= 0) {
      this.modalService
        .openAlertModal('error', 'Error', 'El precio debe ser mayor a 0.')
        .subscribe();
      return;
    }
    if (!cantidad || cantidad <= 0) {
      this.modalService
        .openAlertModal('error', 'Error', 'La cantidad debe ser mayor a 0.')
        .subscribe();
      return;
    }
    const nuevo = {
      id: this.contadorConceptos++,
      nombre: concepto,
      precio: precio,
      cantidad: cantidad,
      subtotal: precio * cantidad,
    };
    this.detallePaquete = [...this.detallePaquete, nuevo];
    this.form.patchValue(
      {
        conceptoAgregar: '',
        precioAgregar: 0,
        cantidadAgregar: 1,
      },
      { emitEvent: false },
    );

    this.calcularTotal();
  }

  editar(item: any): void {
    const cantidad = prompt('Cantidad:', String(item.cantidad));
    const n = Number(cantidad);
    if (!isNaN(n) && n > 0) {
      item.cantidad = n;
      item.subtotal = n * item.precio;
      this.calcularTotal();
    }
  }

  eliminar(item: any): void {
    this.detallePaquete = this.detallePaquete.filter((p) => p.id !== item.id);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.total = this.detallePaquete.reduce((acc, p) => acc + p.subtotal, 0);

    const formaPago = this.form.get('formaPago')?.value;
    const pago = Number(this.form.get('pago')?.value || 0);

    if (formaPago === '01 Efectivo') {
      this.cambio = pago >= this.total ? pago - this.total : 0;
    } else {
      this.cambio = 0;
      if (this.form.get('pago')?.value !== 0) {
        this.form.get('pago')?.setValue(0, { emitEvent: false });
      }
    }
  }

  cargarDatos(_event: TableLazyLoadEvent) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Completa los datos obligatorios del envío.',
        )
        .subscribe();
      return;
    }

    if (this.detallePaquete.length === 0 || this.total <= 0) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Debe agregar al menos un concepto y el total debe ser mayor a 0.',
        )
        .subscribe();
      return;
    }

    const formaPago = this.form.get('formaPago')?.value;
    const pago = Number(this.form.get('pago')?.value || 0);

    if (formaPago === '01 Efectivo' && pago < this.total) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'El pago debe ser igual o mayor al total.',
        )
        .subscribe();
      return;
    }

    const detalleAdaptado = this.detallePaquete.map((prod) => ({
      concepto: prod.nombre,
      cantidad: prod.cantidad,
      precio: prod.precio,
      subtotal: prod.subtotal,
    }));

    const payload = {
      remitente: this.form.get('remitente')?.value,
      destinatario: this.form.get('destinatario')?.value,
      baseOrigen: this.baseOrigenId ? { id: this.baseOrigenId } : null,
      destino: { id: this.form.get('baseDestinoId')?.value },

      usuario: { id: this.authService.getUsuario()?.id },
      formaPago,
      total: this.total,
      pago: formaPago === '01 Efectivo' ? pago : this.total,
      cambio: formaPago === '01 Efectivo' ? this.cambio : 0,

      detallePaquete: detalleAdaptado,
    };

    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de guardar la venta?',
        true,
      )
      .subscribe({
        next: (resp) => {
          if (resp.resultado) {
            this.paqueteService.agregarRegistro(payload).subscribe({
              next: (r) => {
                if (r.success) {
                  this.ref.close({ idVenta: r.data.id });
                } else {
                  this.modalService
                    .openAlertModal('error', 'Error', r.message)
                    .subscribe();
                }
              },
              error: (e) => {
                this.modalService
                  .openAlertModal(
                    'error',
                    'Error',
                    'Ocurrió un problema al guardar.',
                  )
                  .subscribe();
                console.error(e);
              },
            });
          }
        },
      });
  }

  cerrar(): void {
    this.ref.close(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
