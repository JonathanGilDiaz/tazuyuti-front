import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, Usuario } from '@app/core/interfaces/apiResponse';
import { DataTableParams } from '@app/shared/ui/datatables/interfaces/datatable';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(private httpClient: HttpClient) {}

  obtenerRegistros(datos: DataTableParams): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      `${environment.baseUrl}/usuarios`,
      datos,
    );
  }

  agregarRegistro(usuario: Usuario): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      `${environment.baseUrl}/usuarios/save`,
      usuario,
    );
  }

  actualizarRegistro(usuario: Usuario): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      `${environment.baseUrl}/usuarios/update`,
      usuario,
    );
  }

  activarUsuario(usuario: Usuario): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      `${environment.baseUrl}/usuarios/active`,
      usuario,
    );
  }

  obtenerRegistro(id: number): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/usuarios/${id}/detail`,
    );
  }

  catalogos(): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/usuarios/catalogs`,
    );
  }

  detailTransferencias(id: number, fechaInicio: string, fechaFin: string) {
    return this.httpClient.get<ApiResponse<any>>(
      `${environment.baseUrl}/usuarios/${id}/detailTransferencias`,
      {
        params: {
          fechaInicio,
          fechaFin,
        },
      },
    );
  }
}
