import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/core/interfaces/apiResponse';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(
    private httpClient : HttpClient
  ) { }


  obtenerRegistros(id: number, datos : DataTableParams):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/venta/${id}/index`,datos);
  }
  
  agregarRegistro(datos : any):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/venta/save`,datos);
  }

  obtenerRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/venta/${id}/detail`);
  }

  eliminarRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/venta/${id}/ticket`,{});
  }

    obtenerTicket(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/venta/${id}/ticket`);
  }

   ordenObtenerRegistros(id: number, datos : DataTableParams):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/ordenCompra/${id}/index`,datos);
  }
  
  ordenAgregarRegistro(datos : any):Observable<ApiResponse<any>>{
    return this.httpClient.post<ApiResponse<any>>(`${environment.baseUrl}/ordenCompra/save`,datos);
  }

  ordenObtenerRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/ordenCompra/${id}/detail`);
  }

  ordenEliminarRegistro(id : number):Observable<ApiResponse<any>>{
    return this.httpClient.get<ApiResponse<any>>(`${environment.baseUrl}/ordenCompra/${id}/ticket`,{});
  }
}
