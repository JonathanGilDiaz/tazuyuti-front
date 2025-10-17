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
  templateUrl: './orden-add.component.html',
  styleUrl: './orden-add.component.css',
})
export class OrdenAddComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  destroy$ = new Subject<void>();
  fechaFormateada: string;
  refDialog: DynamicDialogRef | undefined;
  productos: Producto[] = [];
  sugerencias: Producto[] = [];
  detalleOrdenCompras: any[] = [];
  total: number = 0;
  totalRecords: number = 0;

  constructor(
    private fb: FormBuilder,
    private ventaService: VentasService,
    private productoService: ProductosService,
    private modalService: ModalService,
    private authService: AuthService,
    public ref: DynamicDialogRef
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
  }

  trackByProd = (_: number, p: Producto) => p.id;

  filtrarProductos() {
    const texto: string = (this.form.get('textoBusqueda')?.value || '')
      .toLowerCase()
      .trim();

    if (!texto) {
      this.sugerencias = [];
      return;
    }

    const productoPorCodigo = this.productos.find(
      (p) => p.codigo?.toLowerCase() === texto
    );
    if (productoPorCodigo) {
      this.agregarProducto(productoPorCodigo);
      return;
    }

    this.sugerencias = this.productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(texto) ||
        p.codigo?.toLowerCase().includes(texto)
    );
  }

  buscarPorCodigo() {
    const texto: string = (this.form.get('textoBusqueda')?.value || '').trim();
    const producto = this.productos.find(
      (p) => p.codigo?.toLowerCase() === texto.toLowerCase()
    );
    if (producto) this.agregarProducto(producto);
  }

  agregarProducto(producto: Producto) {
    const existente = this.detalleOrdenCompras.find(
      (p) => p.id === producto.id
    );

    if (existente) {
      // ✅ Mantener precio editado por el usuario
      existente.cantidad += 1;
      existente.subtotal = existente.cantidad * existente.precio;
    } else {
      this.detalleOrdenCompras = [
        ...this.detalleOrdenCompras,
        {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          unidad: producto.unidad,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ];
    }

    this.calcularTotal();
    this.form.get('textoBusqueda')?.setValue('');
    this.sugerencias = [];
  }

  editarPrecio(item: any) {
    const nuevoPrecio = prompt('Precio unitario:', String(item.precio));
    const precioNum = Number(nuevoPrecio);
    if (!isNaN(precioNum) && precioNum > 0) {
      item.precio = precioNum;
      item.subtotal = item.precio * item.cantidad;
      this.calcularTotal();
    }
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
    this.detalleOrdenCompras = this.detalleOrdenCompras.filter(
      (p) => p.id !== item.id
    );
    this.calcularTotal();
  }

  calcularTotal() {
    this.total = this.detalleOrdenCompras.reduce(
      (acc, p) => acc + p.subtotal,
      0
    );
  }

  cargarDatos(event: TableLazyLoadEvent) {}

  iniciarFormulario(): void {
    this.form = this.fb.group({
      total: [0, Validators.required],
      textoBusqueda: [''],
    });
  }

  eventoCancelar() {
    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de cancelar la acción?',
        true
      )
      .subscribe({
        next: (response) => {
          if (response.resultado) {
            this.ref.close(false);
          }
        },
      });
  }

  onSubmit() {
    if (this.detalleOrdenCompras.length === 0 || this.total <= 0) {
      this.modalService
        .openAlertModal(
          'error',
          'Error',
          'Debe agregar al menos un producto y el total debe ser mayor a 0.'
        )
        .subscribe();
      return;
    }

    const detalleAdaptado = this.detalleOrdenCompras.map((prod) => ({
      producto: { id: prod.id },
      cantidad: prod.cantidad,
      precio: prod.precio,
      subtotal: prod.subtotal,
    }));

    const venta = {
      usuario: { id: this.authService.getUsuario()?.id },
      total: this.total,
      detalleOrdenCompras: detalleAdaptado,
    };

    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de guardar la venta?',
        true
      )
      .subscribe({
        next: (resp) => {
          if (resp.resultado) {
            this.ventaService.ordenAgregarRegistro(venta).subscribe({
              next: (resp) => {
                if (resp.success) {
                  this.modalService
                    .openAlertModal('exito', 'Éxito', resp.message)
                    .subscribe(() => {
                      this.ref.close();
                    });
                } else {
                  this.modalService
                    .openAlertModal('error', 'Error', resp.message)
                    .subscribe();
                }
              },
            });
          }
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
