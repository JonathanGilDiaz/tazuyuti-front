import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PrimeNGModules } from '@app/primeng-config';
import { AuthService } from '@app/core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { BoletosService } from '@app/data/services/boletos.service';
import { PrecioEquipaje } from '@app/core/interfaces/apiResponse';
import { ModalService } from '@app/shared/ui/modal/services/modal.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

type Id = number;

interface Sucursal {
  id: Id;
  nombre: string;
}
interface PrecioBoleto {
  id: Id;
  origen: Sucursal;
  destino: string;
  entre1: Sucursal;
  entre2: Sucursal;
  precio: number;
  estado: boolean;
}
interface UnidadInfo {
  id: Id;
  nombre: string;
  capacidad: number;
}
interface HorarioRuta {
  rutaId: Id;
  detalleRutaId: Id;
  unidad: UnidadInfo;
  hora: string;
  segmentos: Array<{
    salida: Sucursal;
    llegada: Sucursal;
    ocupados: number[];
  }>;
  ocupadosUnion: number[];
}

interface CatalogosTaquilla {
  pasajes: PrecioBoleto[];
  sucursal: Sucursal[];
}

@Component({
  selector: 'app-taquilla-guardar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModules, FormsModule],
  templateUrl: './taquilla-add.component.html',
  styleUrls: ['./taquilla-add.component.css'],
})
export class TaquillaAddComponent implements OnInit {
  form!: FormGroup;
  trackByNum = (_: number, item: any) => item.num ?? item.texto;

  // catálogos
  catalogos = signal<CatalogosTaquilla | null>(null);
  sucursales = signal<Sucursal[]>([]);
  pasajes = signal<PrecioBoleto[]>([]);

  // dependientes
  destinosFiltrados = signal<PrecioBoleto[]>([]);
  horarios = signal<HorarioRuta[]>([]);

  // selección
  horarioSeleccionado = signal<HorarioRuta | null>(null);
  asientosOcupados = signal<Set<number>>(new Set());
  asientosSeleccionados = signal<number[]>([]);

  // resumen
  capacidadActual = computed(
    () => this.horarioSeleccionado()?.unidad.capacidad ?? 0
  );
  disponibles = computed(
    () => this.capacidadActual() - this.asientosOcupados().size
  );
  requeridos = computed(
    () =>
      Number(this.form.get('adultos')?.value || 0) +
      Number(this.form.get('ninos')?.value || 0)
  );

  resumen: { origen: string; destino: string; hora: string } | null = null;

  // helpers de UI
  cargandoCatalogos = signal(false);
  cargandoHorarios = signal(false);

  continuarPaso2 = false;
  titular = '';
  precioBoleto = 0; // se setea con el pasaje elegido
  equipajesCatalogo: PrecioEquipaje[] = [];
  equipajesAgregados: { concepto: PrecioEquipaje; cantidad: number }[] = [];
  detalleRutaId = 0;
  formaPago = '01 Efectivo'; // por defecto efectivo
  montoPago = 0;
  cambio = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private boletoService: BoletosService,
    private modalService: ModalService,
    public ref: DynamicDialogRef
  ) {}

  // ===================== EFFECTS =====================

  origenEffect = effect(
    () => {
      const org = this.form?.get('origen')?.value as Id | null;
      const c = this.pasajes();
      if (!org || !c.length) {
        this.destinosFiltrados.set([]);
        return;
      }
      const destinos = c.filter((p) => p.origen.id === org);
      this.destinosFiltrados.set(destinos);

      this.form.patchValue({ destino: null, hora: null });
      this.horarios.set([]);
      this.horarioSeleccionado.set(null);
      this.asientosOcupados.set(new Set());
      this.asientosSeleccionados.set([]);
    },
    { allowSignalWrites: true }
  );

  destinoFechaEffect = effect(
    () => {
      const destId = this.form?.get('destino')?.value as Id | null;
      const fecha = this.form?.get('fecha')?.value as string | null;
      const origenId = this.form?.get('origen')?.value as Id | null;
      console.log('DEBUG destinoFechaEffect', { destId, fecha, origenId });
      if (!destId || !fecha || !origenId) return;

      const precio = this.destinosFiltrados().find((p) => p.id === destId);
      if (!precio) return;

      const direccion = precio.entre2?.id
        ? { hasta: precio.entre2.id }
        : { hasta: null };

      this.cargarHorarios({
        fecha,
        origenId,
        destinoIdPrecio: destId,
        hastaId: (direccion as any).hasta,
      });
    },
    { allowSignalWrites: true }
  );

  horaEffect = effect(
    () => {
      console.log('entee');
      const horaId = this.form?.get('hora')?.value as number | null;
      if (!horaId) {
        this.horarioSeleccionado.set(null);
        this.asientosOcupados.set(new Set());
        return;
      }

      const hSel = this.horarios().find((h) => h.rutaId === horaId) || null;
      this.horarioSeleccionado.set(hSel);

      if (!hSel) {
        this.asientosOcupados.set(new Set());
        return;
      }

      this.asientosOcupados.set(new Set(hSel.ocupadosUnion || []));
      this.asientosSeleccionados.set(
        this.asientosSeleccionados().filter(
          (n) => !(hSel.ocupadosUnion || []).includes(n)
        )
      );
    },
    { allowSignalWrites: true } // 👈 importante
  );

  requeridosEffect = effect(
    () => {
      const req = this.requeridos();
      console.log('🟢 requeridosEffect actual:', req);
      // Ya no recortamos aquí
    },
    { allowSignalWrites: true }
  );

  // ===================== INIT =====================

  // 👈 elimina esta línea
  // horaSignal = toSignal(this.form.get('hora')!.valueChanges, { initialValue: null });
  requeridosNum = 0;

  ngOnInit(): void {
    this.form = this.fb.group({
      fecha: [this.hoyISO(), Validators.required],
      origen: [null as Id | null, Validators.required],
      destino: [null as Id | null, Validators.required],
      hora: [null as number | null, Validators.required],
      adultos: [1, [Validators.required, Validators.min(0)]],
      ninos: [0, [Validators.required, Validators.min(0)]],
      equipajeId: [null as PrecioEquipaje | null],
      equipajeCantidad: [1, [Validators.min(1)]],
      formaPago: ['01 Efectivo', Validators.required],
      montoPago: [0, [Validators.min(0)]],
      cambio: [0],
      titular: [''],
      monto: [0, Validators.required],
    });
    this.form
      .get('adultos')
      ?.valueChanges.subscribe(() => this.recalcularRequeridos());
    this.form
      .get('ninos')
      ?.valueChanges.subscribe(() => this.recalcularRequeridos());

    this.cargarCatalogos();

    const sucUsuario = this.auth.getUsuario()?.sucursal?.id;
    if (sucUsuario) this.form.get('origen')?.setValue(sucUsuario);

    // 🔥 Cuando cambie origen
    this.form.get('origen')?.valueChanges.subscribe(() => {
      this.form.patchValue({ destino: null, hora: null });
      this.destinosFiltrados.set([]);
      this.horarios.set([]);
      this.horarioSeleccionado.set(null);
      this.asientosOcupados.set(new Set());
      this.asientosSeleccionados.set([]);

      const org = this.form.get('origen')?.value;
      const c = this.pasajes();
      if (org && c.length) {
        const destinos = c.filter((p) => p.origen.id === org);
        this.destinosFiltrados.set(destinos);
      }
    });

    // 🔥 Cuando cambie destino o fecha
    this.form
      .get('destino')
      ?.valueChanges.subscribe(() => this.triggerHorarios());
    this.form
      .get('fecha')
      ?.valueChanges.subscribe(() => this.triggerHorarios());

    // 🔥 Cuando cambie la hora
    this.form.get('hora')?.valueChanges.subscribe((horaId: number | null) => {
      console.log('CAMBIO HORA', horaId);

      if (!horaId) {
        this.horarioSeleccionado.set(null);
        this.asientosOcupados.set(new Set());
        return;
      }

      const hSel = this.horarios().find((h) => h.rutaId === horaId) || null;
      this.horarioSeleccionado.set(hSel);

      if (!hSel) {
        this.asientosOcupados.set(new Set());
        return;
      }
      this.detalleRutaId = hSel.detalleRutaId;
      console.log('El ruta ' + this.detalleRutaId);
      this.asientosOcupados.set(new Set(hSel.ocupadosUnion || []));
      this.asientosSeleccionados.set(
        this.asientosSeleccionados().filter(
          (n) => !(hSel.ocupadosUnion || []).includes(n)
        )
      );
    });

    // 🔥 Cuando cambien boletos adultos o niños
    this.form.get('adultos')?.valueChanges.subscribe(() => {
      this.recalcularRequeridos();
    });
    this.form.get('ninos')?.valueChanges.subscribe(() => {
      this.recalcularRequeridos();
    });
    this.recalcularRequeridos();

    this.boletoService.catalogos().subscribe({
      next: (response) => {
        if (response.success) {
          this.catalogos.set(response.data);
          this.pasajes.set(response.data.pasajes || []);
          this.sucursales.set(response.data.sucursal || []);
          this.equipajesCatalogo = response.data.equipajes || [];
        }
      },
    });
  }

  private recalcularRequeridos() {
    this.requeridosNum =
      Number(this.form.get('adultos')?.value || 0) +
      Number(this.form.get('ninos')?.value || 0);

    // ✅ solo aquí se recortan los seleccionados
    if (this.asientosSeleccionados().length > this.requeridosNum) {
      this.asientosSeleccionados.set(
        this.asientosSeleccionados().slice(0, this.requeridosNum)
      );
    }
  }

  private triggerHorarios() {
    const destId = this.form.get('destino')?.value as Id | null;
    const fecha = this.form.get('fecha')?.value as string | null;
    const origenId = this.form.get('origen')?.value as Id | null;

    console.log('TRIGGER HORARIOS', { destId, fecha, origenId });

    if (!destId || !fecha || !origenId) return;

    const precio = this.destinosFiltrados().find((p) => p.id === destId);
    if (!precio) return;

    const direccion = precio.entre2?.id
      ? { hasta: precio.entre2.id }
      : { hasta: null };

    this.cargarHorarios({
      fecha,
      origenId,
      destinoIdPrecio: destId,
      hastaId: (direccion as any).hasta,
    });

    // limpiar hora al cambiar destino
    this.form.patchValue({ hora: null });
    this.horarios.set([]);
    this.horarioSeleccionado.set(null);
    this.asientosOcupados.set(new Set());
    this.asientosSeleccionados.set([]);
  }

  // ===================== API =====================

  private cargarCatalogos() {
    this.cargandoCatalogos.set(true);
    this.boletoService.catalogos().subscribe({
      next: (response) => {
        if (response.success) {
          this.catalogos.set(response.data);
          this.pasajes.set(response.data.pasajes || []);
          this.sucursales.set(response.data.sucursal || []);
        }
      },
      complete: () => this.cargandoCatalogos.set(false),
    });
  }
  private cargarHorarios(params: {
    fecha: string;
    origenId: number;
    destinoIdPrecio: number;
    hastaId: number | null;
  }) {
    this.cargandoHorarios.set(true);

    this.boletoService
      .horarios(
        params.fecha,
        params.origenId,
        params.destinoIdPrecio,
        params.hastaId
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.horarios.set(response.data);
          } else {
            this.horarios.set([]);
          }
          this.form.patchValue({ hora: null });
        },
        complete: () => this.cargandoHorarios.set(false),
      });
  }
  // ===================== ASIENTOS =====================

  esOcupado(n: number) {
    return this.asientosOcupados().has(n);
  }
  esSeleccionado(n: number) {
    return this.asientosSeleccionados().includes(n);
  }
  toggleAsiento(n: number) {
    if (this.esOcupado(n)) return;

    const sel = [...this.asientosSeleccionados()];
    const i = sel.indexOf(n);

    if (i >= 0) {
      sel.splice(i, 1);
    } else {
      console.log(sel.length);
      console.log('Requeridos:', this.requeridosNum); // 👈 aquí con paréntesis
      if (sel.length >= this.requeridosNum) {
        console.log('🚨 BLOQUEADO: ya no puedes seleccionar más asientos');
        return;
      }
      console.log('✅ Se permite agregar asiento');
      sel.push(n);
    }

    this.asientosSeleccionados.set(sel);
  }

  // ===================== LAYOUT =====================

  layoutAsientos() {
    const cap = this.capacidadActual();

    if (cap === 21) {
      return [
        { tipo: 'chofer', texto: 'CHOFER' },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 20 },
        { tipo: 'asiento', num: 1 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 2 },
        { tipo: 'asiento', num: 3 },
        { tipo: 'etiqueta', texto: 'PANTALLA' },
        { tipo: 'etiqueta', texto: 'ACCESO' },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 4 },
        { tipo: 'asiento', num: 5 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 6 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 7 },
        { tipo: 'asiento', num: 8 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 9 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 10 },
        { tipo: 'asiento', num: 11 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 12 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 13 },
        { tipo: 'asiento', num: 14 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 15 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 16 },
        { tipo: 'asiento', num: 17 },
        { tipo: 'asiento', num: 18 },
        { tipo: 'asiento', num: 19 },
        { tipo: 'linea' },
      ];
    }
    if (cap === 14) {
      return [
        { tipo: 'chofer', texto: 'CHOFER' },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 14 },
        { tipo: 'asiento', num: 1 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 2 },
        { tipo: 'asiento', num: 3 },
        { tipo: 'espacio' },
        { tipo: 'etiqueta', texto: 'ACCESO' },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 4 },
        { tipo: 'asiento', num: 5 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 6 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 7 },
        { tipo: 'asiento', num: 8 },
        { tipo: 'espacio' },
        { tipo: 'asiento', num: 9 },
        { tipo: 'linea' },

        { tipo: 'asiento', num: 10 },
        { tipo: 'asiento', num: 11 },
        { tipo: 'asiento', num: 12 },
        { tipo: 'asiento', num: 13 },
        { tipo: 'linea' },
      ];
    }

    return [];
  }

  continuar() {
    if (!this.form.valid || !this.horarioSeleccionado()) return;
    if (this.requeridosNum <= 0) return;
    if (this.asientosSeleccionados().length !== this.requeridosNum) return;

    const destino = this.destinosFiltrados().find(
      (p) => p.id === this.form.value.destino
    );

    this.resumen = {
      origen:
        this.sucursales().find((s) => s.id === this.form.value.origen)
          ?.nombre || '',
      destino: destino?.destino || '',
      hora: this.horarioSeleccionado()?.hora || '',
    };

    this.precioBoleto = destino?.precio || 0;
    this.continuarPaso2 = true;
  }
  // subtotales
  subtotalAdultos() {
    return this.form.value.adultos * this.precioBoleto;
  }
  subtotalNinos() {
    return this.form.value.ninos * (this.precioBoleto / 2);
  }

  // equipajes
  abrirEquipaje() {
    const concepto = this.equipajesCatalogo[0]; // por ahora primer elemento
    const cantidad = 1;
    this.equipajesAgregados.push({ concepto, cantidad });
  }
  eliminarEquipaje(i: number) {
    this.equipajesAgregados.splice(i, 1);
  }

  // total
  calcularTotal() {
    let total = this.subtotalAdultos() + this.subtotalNinos();
    this.equipajesAgregados.forEach((eq) => {
      total += eq.cantidad * eq.concepto.precio;
    });
    return total;
  }

  // pago
  calcularCambio() {
    const monto = this.form.get('montoPago')?.value || 0;
    const total = this.calcularTotal();
    this.form.patchValue({
      cambio: monto >= total ? monto - total : 0,
    });
  }

  nuevoEquipajeId: number | null = null;
  nuevoEquipajeCantidad: number = 1;

  agregarEquipaje() {
    const concepto = this.form.get('equipajeId')
      ?.value as PrecioEquipaje | null;
    const cantidad = this.form.get('equipajeCantidad')?.value as number;
    console.log(concepto);
    console.log(cantidad);

    if (!concepto || !cantidad || cantidad <= 0) {
      console.log('⚠️ Equipaje inválido');
      return;
    }

    this.equipajesAgregados.push({ concepto, cantidad });

    // resetear campos en el form
    this.form.patchValue({
      equipajeId: null,
      equipajeCantidad: 1,
    });
  }

  // ===================== UTILS =====================

  hoyISO(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  compararHorario = (a: HorarioRuta | null, b: HorarioRuta | null): boolean => {
    if (!a || !b) return false;
    return (
      a.rutaId === b.rutaId && a.hora === b.hora && a.unidad.id === b.unidad.id
    );
  };

  guardar() {
    if (!this.horarioSeleccionado()) return;

    const destino = this.destinosFiltrados().find(
      (p) => p.id === this.form.value.destino
    );

    const boletoPayload = {
      usuario: { id: this.auth.getUsuario()?.id },
      formaPago: this.form.value.formaPago,
      total: this.calcularTotal(),
      pago: this.form.value.montoPago,
      cliente: this.form.value.titular, // 👈 añadir titular
      cambio: this.form.value.cambio,
      detalleRutaSalida: { id: this.detalleRutaId }, // 👈 detalle_ruta_salida_id
      precioBoleto: { id: this.form.value.destino }, // 👈 boleto_precio_id
      totalBoletos: this.requeridosNum,
      asientos: this.asientosSeleccionados().join(','),
      viaje: destino ? destino.origen.nombre + ' → ' + destino.destino : '',

      // 🔹 Solo boletos (adultos y niños)
      detalleBoletos: [
        ...(this.form.value.adultos > 0
          ? [
              {
                precioBoleto: { id: this.form.value.destino },
                niño: false,
                cantidad: this.form.value.adultos,
                precio: this.precioBoleto,
                subtotal: this.subtotalAdultos(),
              },
            ]
          : []),
        ...(this.form.value.ninos > 0
          ? [
              {
                precioBoleto: { id: this.form.value.destino },
                niño: true,
                cantidad: this.form.value.ninos,
                precio: this.precioBoleto / 2,
                subtotal: this.subtotalNinos(),
              },
            ]
          : []),
      ],

      // 🔹 Solo equipajes adicionales
      detalleEquipajeBoleto: this.equipajesAgregados.map((eq) => ({
        precioEquipaje: { id: eq.concepto.id },
        cantidad: eq.cantidad,
        precio: eq.concepto.precio,
        subtotal: eq.cantidad * eq.concepto.precio,
      })),
    };

    this.boletoService.agregarRegistro(boletoPayload).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.modalService
            .openAlertModal('exito', 'Éxito', resp.message)
            .subscribe({
              complete: () => {
                this.ref.close(true);
              },
            });
        } else {
          this.modalService.openAlertModal(
            'error',
            'Error',
            resp.message || 'No se pudo guardar',
            false
          );
        }
      },
      error: (err) => {
        console.error('Error al guardar', err);
        this.modalService.openAlertModal(
          'error',
          'Error',
          'Ocurrió un problema al guardar',
          false
        );
      },
    });
  }

  confirmarGuardar() {
    this.modalService
      .openAlertModal(
        'advertencia',
        'Atención',
        '¿Está seguro de guardar los datos?',
        true
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.guardar();
          }
        },
      });
  }

  cerrar() {
    this.ref.close();
  }
}
