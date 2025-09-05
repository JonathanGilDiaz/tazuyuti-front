import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/core/interfaces/apiResponse';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class preciosPaqueteriaService {

  constructor(
    private httpClient : HttpClient
  ) { }


  obtenerRegistros(datos : DataTableParams):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/precioPaqueteria/index`,datos);
  }
  
  agregarRegistro(datos : FormData):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/precioPaqueteria/save`,datos);
  }

  actualizarRegistro(datos : FormData):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/precioPaqueteria/update`,datos);
  }

  obtenerRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/precioPaqueteria/${id}/detail`);
  }

  eliminarRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/precioPaqueteria/${id}/delete`,{});
  }

   obtenerTodos():Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/precioPaqueteria/getAll`);
  }
}
