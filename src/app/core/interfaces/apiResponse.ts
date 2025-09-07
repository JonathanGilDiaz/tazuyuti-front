import { Time } from "@angular/common";

//respuesta del api generica
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Nueva interface que contiene las variables necesarias
 * para la paginación.
 */
export interface ApiResponseWithPagination<T> {
  success: boolean;
  message: string;
  data: DataContent<T>;
}

/**
 * Interface para la obtención de archivos
 */

export interface DataArchivo {
  archivo: Archivo;
}
export interface Archivo {
  base64Content: string;
  mimeType: string;
}

export interface DataContent<T> {
  content: T[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: Sort;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Etiqueta {
  etiqueta: string;
  valor: string;
}

export interface DetalleBoton {
  class: string;
  nombre: string;
}

export interface UsuarioData {
  usuario: Usuario;
  menus: MenuElement[];
  token: string;
}

export interface MenuElement {
  subMenus: SubMenuClass[];
  menu: SubMenuClass;
}

export interface SubMenuClass {
  id: number;
  opcion: Opcion;
  depens: number;
  orden: number;
  activo: boolean;
}

export interface Opcion {
  id: number;
  descripcion: string;
  opcion: string;
  url: string;
  icono: string;
  nivel: number;
  activo: boolean;
}

export interface Usuario {
  id?: number;
  nombre: string;
  usuario: string;
  sucursal: Sucursal;
  rol: Rol;
  activo: boolean;
}

export interface Rol {
  id: number;
  rol: string;
  activo: boolean;
}

export interface Sucursal {
  id: number;
  nombre: string;
  horario: string;
  telefono: string;
  direccion: string;
}

export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  unidad: string;
  costo: number;
  precio: number;
  estado: boolean;
  fechaCreacion: Date;
  fechaActualziacion: Date;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreComercial: string;
  rfc: number;
  sociedad: string;
  telefono: string;
  regimenFiscal: string;
  direccion: string;
  codigoPostal: number;
  tipoPersona: string;
  estado: boolean;
  fechaCreacion: Date;
  fechaActualziacion: Date;
}

export interface TipoCamioneta {
  id: number;
  nombre: string;
  capacidad: number;
}

export interface Unidad {
  id: number;
  nombre: string;
  placas: string;
  encargado: string;
  estado: boolean;
  tipoCamioneta: TipoCamioneta;
}

export interface DetalleVenta {
  id: number;
  venta: Venta;
  producto: Producto;
  cantidad: number;
  precio: number;
  subTotal: number;
}

export interface Venta {
  id: number;
  usuario: Usuario;
  formaPago: string;
  total: number;
  pago: number;
  cambio: number;
  fechaCreacion: Date;
  estado: boolean;
  folio: string;
  detalleVentas: DetalleVenta[];
}

export interface PrecioPaqueteria {
  id: number;
  nombre: string;
  descripcion: string;
  medidas: String;
  peso: number;
  precio: number;
  estado: boolean;
}

export interface PrecioEquipaje {
  id: number;
  nombre: string;
  descripcion: string;
  medidas: String;
  peso: number;
  precio: number;
  estado: boolean;
}

export interface DetallePaquete {
  id: number;
  paquete: Paquete;
  cantidad: number;
  precio: number;
  subTotal: number;
}

export interface Paquete {
  id: number;
  destinatario: string;
  remitente: string;
  fechaCreacion: Date;
  usuario: Usuario;
  formaPago: string;
  total: number;
  estado: EstadoPaquete;
  destino: Sucursal;
  folio: string;
  detallePaquete: DetallePaquete[];
}

export interface EstadoPaquete{
  id: number;
  nombre: string;
}

export interface Ruta{
  id: number;
  unidad: Unidad;
  viaje: String;
  repeticion: string;
  hora: Time;
  estado: boolean;
}
