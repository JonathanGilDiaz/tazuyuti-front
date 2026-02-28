import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { PrimeNGModules } from '@app/primeng-config';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Producto } from '@app/core/interfaces/apiResponse';
import { TableLazyLoadEvent } from 'primeng/table';
import { VentasService } from '@app/data/services/ventas.service';
import { ProductosService } from '@app/data/services/productos.service';
import { AuthService } from '@app/core/services/auth.service';
@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, PrimeNGModules, ReactiveFormsModule, DropdownModule],
  providers: [DialogService],
  templateUrl: './ventas-add.component.html',
  styleUrl: './ventas-add.component.css',
})
export class VentasAddComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();
  fechaFormateada: string;
  refDialog: DynamicDialogRef | undefined;
  productos: Producto[] = [];
  sugerencias: Producto[] = [];
  detalleVentas: any[] = [];
  total: number = 0;
  formaPago: string = '01 Efectivo';
  pago: number = 0;
  cambio: number = 0;
  totalRecords: number = 0;
  productoSeleccionado: Producto | null = null;
  cantidadSeleccionada: number | null = null;
  guardando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private ventaService: VentasService,
    private productoService: ProductosService,
    private modalService: ModalService,
    private authService: AuthService,
    public ref: DynamicDialogRef,
  ) {
    this.iniciarFormulario();
  }

  ngOnInit(): void {
    this.productoService.obtenerTodos().subscribe({
      next: (resp) => {
        if (resp.success) {
          this.productos = resp.data;
        }
      },
    });

    this.form.get('pago')?.valueChanges.subscribe(() => this.calcularTotal());
    this.form
      .get('formaPago')
      ?.valueChanges.subscribe(() => this.calcularTotal());
  }

  trackByProd = (_: number, p: Producto) => p.id;

  filtrarProductos() {
    const texto: string = (this.form.get('textoBusqueda')?.value || '')
      .toLowerCase()
      .trim();
    if (!texto) {
      this.sugerencias = [];
      this.productoSeleccionado = null;
      return;
    }
    const productoPorCodigo = this.productos.find(
      (p) => p.codigo?.toLowerCase() === texto,
    );
    if (productoPorCodigo) {
      this.seleccionarProducto(productoPorCodigo);
      return;
    }
    if (
      this.productoSeleccionado &&
      this.productoSeleccionado.nombre.toLowerCase() !== texto &&
      this.productoSeleccionado.codigo?.toLowerCase() !== texto
    ) {
      this.productoSeleccionado = null;
    }
    this.sugerencias = this.productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(texto) ||
        p.codigo?.toLowerCase().includes(texto),
    );
  }

  seleccionarProducto(producto: Producto) {
    this.productoSeleccionado = producto;
    this.form.get('textoBusqueda')?.setValue(producto.nombre);
    this.sugerencias = [];
    setTimeout(() => {
      const inputCantidad = document.querySelector(
        'input[formControlName="cantidad"]',
      ) as HTMLInputElement;
      inputCantidad?.focus();
    });
  }

  confirmarAgregar() {
    if (!this.productoSeleccionado) {
      this.modalService
        .openAlertModal('error', 'Error', 'Debe seleccionar un producto.')
        .subscribe();
      return;
    }
    const cantidadControl = this.form.get('cantidad');
    if (!cantidadControl || cantidadControl.invalid) {
      cantidadControl?.markAsTouched();
      this.modalService
        .openAlertModal('error', 'Error', 'Debe ingresar una cantidad válida.')
        .subscribe();
      return;
    }
    const cantidad = Number(cantidadControl.value);
    const existente = this.detalleVentas.find(
      (p) => p.id === this.productoSeleccionado!.id,
    );
    if (existente) {
      existente.cantidad += cantidad;
      existente.subtotal = existente.cantidad * existente.precio;
    } else {
      this.detalleVentas = [
        ...this.detalleVentas,
        {
          id: this.productoSeleccionado.id,
          codigo: this.productoSeleccionado.codigo,
          nombre: this.productoSeleccionado.nombre,
          unidad: this.productoSeleccionado.unidad,
          precio: this.productoSeleccionado.precio,
          cantidad: cantidad,
          subtotal: this.productoSeleccionado.precio * cantidad,
        },
      ];
    }
    this.calcularTotal();
    this.productoSeleccionado = null;
    this.form.get('textoBusqueda')?.setValue('');
    this.form.get('cantidad')?.setValue(null);
  }

  editar(item: any) {
    const cantidad = prompt('Cantidad:', String(item.cantidad));
    const n = Number(cantidad);
    if (!isNaN(n) && n > 0) {
      item.cantidad = n;
      item.subtotal = n * item.precio;
      this.calcularTotal();
    }
  }

  eliminar(item: any) {
    this.detalleVentas = this.detalleVentas.filter((p) => p.id !== item.id);
    this.calcularTotal();
  }

  calcularTotal() {
    this.total = this.detalleVentas.reduce((acc, p) => acc + p.subtotal, 0);

    const formaPago = this.form.get('formaPago')?.value;
    const pago = Number(this.form.get('pago')?.value || 0);

    if (formaPago === '01 Efectivo') {
      this.cambio = pago >= this.total ? pago - this.total : 0;
    } else {
      this.cambio = 0;
      this.form.get('pago')?.setValue(0, { emitEvent: false });
    }
  }

  cargarDatos(event: TableLazyLoadEvent) {}

  iniciarFormulario(): void {
    this.form = this.fb.group({
      total: [0, Validators.required],
      textoBusqueda: [''],
      formaPago: ['01 Efectivo'],
      pago: [0],
      cantidad: [null, [Validators.required, Validators.min(1)]],
    });
  }

  eventoCancelar() {
    this.ref.close(false);
  }

  onSubmit() {
    if (this.guardando) return;
    if (this.detalleVentas.length === 0 || this.total <= 0) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Debe agregar al menos un producto y el total debe ser mayor a 0.',
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
    this.guardando = true;
    const detalleAdaptado = this.detalleVentas.map((prod) => ({
      producto: { id: prod.id },
      cantidad: prod.cantidad,
      precio: prod.precio,
      subtotal: prod.subtotal,
    }));

    const venta = {
      usuario: { id: this.authService.getUsuario()?.id },
      formaPago: formaPago,
      total: this.total,
      pago: formaPago === '01 Efectivo' ? pago : this.total,
      cambio: formaPago === '01 Efectivo' ? this.cambio : 0,
      detalleVentas: detalleAdaptado,
    };
    this.ventaService.agregarRegistro(venta).subscribe({
      next: (resp) => {
        this.guardando = false;
        if (resp.success) {
          this.modalService
            .openAlertModal('exito', 'Éxito', resp.message)
            .subscribe(() => {
              this.ref.close({ idVenta: resp.data.id });
            });
        } else {
          this.modalService
            .openAlertModal('error', 'Error', resp.message)
            .subscribe();
        }
      },
      error: () => {
        this.guardando = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  cancelar() {
    this.ref.close(false);
  }

  cerrar(): void {
    this.ref.close(false);
  }
}
