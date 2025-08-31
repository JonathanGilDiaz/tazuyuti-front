/**
 * Servicio para obtener los registros de la API
 * con configuración de filtros y ordenamiento.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataTableParams } from '../interfaces/datatable';
import { environment } from 'src/environments/environment';
import { FilterMetadata } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class DatatableService {

  constructor(
    private httpClient : HttpClient
  ) { }

  /**
   * 
   * @param url URL de la api que se obtendran los registros.
   * @param datos Cuerpo de varibles para obtener los datos.
   * @returns Observable con los registros obtenidos.
   */
  obtenerRegistros(url : string, datos : DataTableParams):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrl}/${url}`,datos);
  }

  /**
   * Convierte los filtros en un objeto adecuado para el backend,
   * formateando campos de tipo fecha y omitiendo valores nulos o indefinidos.
   * 
   * @param event Evento de tabla que contiene los filtros aplicados.
   * @returns Objeto de filtros con los valores formateados y filtrados.
   */
  procesarFiltros(event: any): Record<string, any> {
    return Object.keys(event.filters).reduce((acc, key) => {
      const filter = event.filters[key] as FilterMetadata;
      
      if (filter && filter.value !== undefined && filter.value !== null) {
        // Formateo de fechas a 'YYYY-MM-DD' si el valor es de tipo Date
        acc[key] = filter.value instanceof Date 
          ? filter.value.toISOString().split('T')[0] 
          : filter.value;
      }
      
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Convierte la información de ordenamiento múltiple en un formato adecuado,
   * aplicando un orden predeterminado si no existen criterios de ordenamiento.
   * 
   * @param event Evento de tabla que contiene los criterios de ordenamiento.
   * @param wihtoutOrder en Falso entra normal, de lo contrario se manda sin filtros para recibirlo como lo manda el back
   * @returns Array de objetos que especifican el campo y la dirección de ordenamiento.
   */
  procesarOrdenamiento(event: any, wihtoutOrder: boolean = false): Array<Record<string, string>> {
    //Si hay ordenamiento seleccionado en la tabla
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      return event.multiSortMeta.map(sort => ({
        [sort.field]: sort.order === 1 ? "asc" : "desc"
      }));
    }

    //Si no hay orden seleccionado y withoutOrder en true, no aplicar ordenamiento
    if (wihtoutOrder) {
      return [];
    }
    
    // Orden por defecto si no hay orden seleccionado y wihtoutOrder es false
    return [{ id: "desc" }];
  }

  /**
   * Agrega un index autoincrementable a un arreglo que contenga paginación.
   * @param listado Arreglo de cualquier tipo de datos.
   * @param paginaActual Pagina actual de la tabla.
   * @param filasPorPagina Número de filas que se muestran en la tabla.
   * @returns Mismo arreglo con una nueva variable llamada index en cada registro del arreglo.
   */
  agregarIndexAutoImcrementalListadoPaginado(listado : any[] ,paginaActual : number, filasPorPagina : number): any[]{
    let index = ((paginaActual - 1) * filasPorPagina) + 1 ;
    return listado.map(content => ({
      ...content,
      index : index++
    }));
  }
}
