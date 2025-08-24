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
    archivo : Archivo;
}
export interface Archivo {
    base64Content: string;
    mimeType:      string;
}

export interface DataContent<T> {
    content:          T[];
    pageable:         Pageable;
    last:             boolean;
    totalPages:       number;
    totalElements:    number;
    size:             number;
    number:           number;
    sort:             Sort;
    first:            boolean;
    numberOfElements: number;
    empty:            boolean;
}

export interface Pageable {
    pageNumber: number;
    pageSize:   number;
    sort:       Sort;
    offset:     number;
    paged:      boolean;
    unpaged:    boolean;
}

export interface Sort {
    empty:    boolean;
    sorted:   boolean;
    unsorted: boolean;
}

export interface Etiqueta {
    etiqueta : string;
    valor : string;
}

export interface DetalleBoton {
    class : string;
    nombre : string;
}

export interface UsuarioData {
    usuario: Usuario;
    menus:   MenuElement[];
    token:   string;
}

export interface MenuElement {
    subMenus: SubMenuClass[];
    menu:     SubMenuClass;
}

export interface SubMenuClass {
    id:     number;
    opcion: Opcion;
    depens: number;
    orden:  number;
    activo: boolean;
}

export interface Opcion {
    id:          number;
    descripcion: string;
    opcion:      string;
    url:         string;
    icono:       string;
    nivel:       number;
    activo:      boolean;
}

export interface Usuario {
    id?:             number;
    nombre:          string;
    usuario:         string;
    sucursal:        Sucursal;
    rol:             Rol;
    activo:          boolean;
}

export interface Rol {
    id:     number;
    rol:    string;
    activo: boolean;
}

export interface Sucursal{
     id:     number;
     nombre: string;
    horario: string;
    telefono: string;
    direccion: string;
}