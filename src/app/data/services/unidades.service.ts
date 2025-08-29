import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/core/interfaces/apiResponse';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadesService {

  constructor(
    private httpClient : HttpClient
  ) { }


  obtenerRegistros(datos : DataTableParams):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/unidad/index`,datos);
  }
  
  agregarRegistro(datos : FormData):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/unidad/save`,datos);
  }

  actualizarRegistro(datos : FormData):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/unidad/update`,datos);
  }

  obtenerRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/unidad/${id}/detail`);
  }

  eliminarRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/unidad/${id}/delete`,{});
  }

    catalogos():Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/unidad/catalogs`);
  }
}
