import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/core/interfaces/apiResponse';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaquetesService {

  constructor(
    private httpClient : HttpClient
  ) { }


  obtenerRegistros(id: number, datos : DataTableParams):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/paquete/${id}/index`,datos);
  }
  
  agregarRegistro(datos : any):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/paquete/save`,datos);
  }

  obtenerRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/paquete/${id}/detail`);
  }

  eliminarRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/paquete/${id}/ticket`,{});
  }

    obtenerTicket(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/paquete/${id}/ticket`);
  }

      catalogos():Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/paquete/catalogs`);
  }
}
