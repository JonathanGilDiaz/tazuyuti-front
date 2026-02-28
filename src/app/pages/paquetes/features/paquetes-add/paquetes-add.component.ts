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
import { PrecioPaqueteria } from '@app/core/interfaces/apiResponse';
import { TableLazyLoadEvent } from 'primeng/table';
import { AuthService } from '@app/core/services/auth.service';
import { PaquetesService } from '@app/data/services/paquetes.service';
import { PrecioPaqueteriaAddComponent } from '@app/pages/precioPaqueteria/features/precio-paqueteria-add/precio-paqueteria-add.component';

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
  precios: PrecioPaqueteria[] = [];
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

  baseOrigenId: number | null = null;
  baseOrigenNombre = '';

  constructor(
    private fb: FormBuilder,
    private paqueteService: PaquetesService,
    private modalService: ModalService,
    private authService: AuthService,
    public ref: DynamicDialogRef,
    private dialogService: DialogService,
  ) {
    this.iniciarFormulario();
  }

  abrirModalNuevoPrecio(): void {
    this.refDialog = this.dialogService.open(PrecioPaqueteriaAddComponent, {
      header: 'Registrar nuevo precio',
      width: '60vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    this.refDialog.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
          this.recargarPrecios(true); 

      });
  }
  private recargarPrecios(seleccionarUltimo: boolean = false): void {
    this.paqueteService
      .catalogos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          if (resp.success) {
            this.precios = resp.data.precios || [];

            if (seleccionarUltimo && this.precios.length > 0) {
              const ultimo = this.precios[this.precios.length - 1];

              this.form.patchValue({
                precioSeleccionadoId: ultimo.id,
              });
            }
          }
        },
      });
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
            this.precios = resp.data.precios || [];
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

  trackByPrec = (_: number, p: PrecioPaqueteria) => p.id;
  trackBySuc = (_: number, s: any) => s.id;

  iniciarFormulario(): void {
    this.form = this.fb.group({
      remitente: ['', [Validators.required, Validators.minLength(2)]],
      destinatario: ['', [Validators.required, Validators.minLength(2)]],
      baseDestinoId: [null, [Validators.required]],

      precioSeleccionadoId: [null],
      cantidadAgregar: [1, [Validators.min(1)]],

      formaPago: ['01 Efectivo', Validators.required],
      pago: [0],

      total: [0],
    });
  }

  private buscarPrecioPorId(id: number): PrecioPaqueteria | undefined {
    return this.precios.find((p) => p.id === id);
  }

  agregarSeleccion(): void {
    const precioId = Number(this.form.get('precioSeleccionadoId')?.value);
    const cantidad = Number(this.form.get('cantidadAgregar')?.value || 0);

    if (!precioId) {
      this.modalService
        .openAlertModal('error', 'Error', 'Selecciona un precio.')
        .subscribe();
      return;
    }

    if (!cantidad || cantidad <= 0 || !Number.isFinite(cantidad)) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'La cantidad debe ser un número mayor a 0.',
        )
        .subscribe();
      return;
    }

    const precioObj = this.buscarPrecioPorId(precioId);
    if (!precioObj) {
      console.error(
        'precioId recibido:',
        precioId,
        'lista de precios:',
        this.precios,
      );
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'El precio seleccionado no es válido.',
        )
        .subscribe();
      return;
    }
    const existente = this.detallePaquete.find((p) => p.id === precioObj.id);
    if (existente) {
      existente.cantidad += cantidad;
      existente.subtotal = existente.cantidad * existente.precio;
    } else {
      this.detallePaquete = [
        ...this.detallePaquete,
        {
          id: precioObj.id,
          nombre: precioObj.nombre,
          precio: precioObj.precio,
          cantidad: cantidad,
          subtotal: cantidad * precioObj.precio,
        },
      ];
    }

    this.form.patchValue(
      { precioSeleccionadoId: null, cantidadAgregar: 1 },
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
      precioPaquete: { id: prod.id },
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
