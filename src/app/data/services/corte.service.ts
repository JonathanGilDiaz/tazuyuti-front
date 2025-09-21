import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/core/interfaces/apiResponse';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CorteService {
  constructor(private httpClient: HttpClient) {}

  obtenerRegistro(id: number): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/corte/usuario/${id}/activo`
    );
  }

  cerrarCorte(payload: any): Observable<ApiResponse<any>> {
      return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/corte/cerrar`, payload);
  }

    obtenerRegistros(id: number, datos : DataTableParams):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/corte/${id}/index`,datos);
  }


  obtenerDetalleCorte(id: number): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/corte/${id}/detalle`
    );
  }
}
