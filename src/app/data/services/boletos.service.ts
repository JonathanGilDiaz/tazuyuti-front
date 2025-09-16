import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/core/interfaces/apiResponse';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BoletosService {
  constructor(private httpClient: HttpClient) {}

  obtenerRegistros(
    id: number,
    datos: DataTableParams
  ): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      `${environment.baseUrl}/taquilla/${id}/index`,
      datos
    );
  }

  agregarRegistro(datos: any): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      `${environment.baseUrl}/taquilla/save`,
      datos
    );
  }

  catalogos(): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/taquilla/catalogs`
    );
  }

  horarios(
    fecha: string,
    origenId: number,
    precioId: number,
    hastaId: number | null
  ): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/taquilla/horarios`,
      {
        params: {
          fecha,
          origen: origenId,
          precioId,
          hasta: String(hastaId ?? ''),
        },
      }
    );
  }

  obtenerRegistro(id: number): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/taquilla/${id}/detail`
    );
  }

  
    obtenerTicket(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/taquilla/${id}/ticket`);
  }

   cancelarBolet(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/taquilla/${id}/cancelar`);
  }
}
