import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { FiltrosPublicaciones, Publicacion, RespuestaMeGusta } from '../models/publicacion';

// Los pedidos de publicaciones al back. El token lo agrega el tokenInterceptor (Paso 7).
@Service()
export class PublicacionesService {
  private readonly httpClient = inject(HttpClient);

  // GET /publicaciones?orden=fecha&offset=0&limit=10 (+ categoria y usuario, si vienen).
  listar(filtros: FiltrosPublicaciones): Observable<Publicacion[]> {
    let url = `${API_URL}/publicaciones?orden=${filtros.orden}&offset=${filtros.offset}&limit=${filtros.limit}`;
    if (filtros.categoria) {
      url += `&categoria=${filtros.categoria}`;
    }
    if (filtros.usuario) {
      url += `&usuario=${filtros.usuario}`;
    }
    return this.httpClient.get<Publicacion[]>(url);
  }

  // Los ids de las publicaciones a las que el usuario de la sesión les dio me gusta.
  misLikes(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${API_URL}/publicaciones/mis-likes`);
  }

  // multipart/form-data: título, mensaje, categoría y la imagen (opcional) viajan juntos.
  crear(datos: FormData): Observable<Publicacion> {
    return this.httpClient.post<Publicacion>(`${API_URL}/publicaciones`, datos);
  }

  // Baja lógica: el back la marca como inactiva.
  borrar(id: string): Observable<{ message: string }> {
    return this.httpClient.delete<{ message: string }>(`${API_URL}/publicaciones/${id}`);
  }

  // El POST del me gusta no lleva datos: el usuario sale del token.
  darMeGusta(id: string): Observable<RespuestaMeGusta> {
    return this.httpClient.post<RespuestaMeGusta>(`${API_URL}/publicaciones/${id}/like`, {});
  }

  quitarMeGusta(id: string): Observable<RespuestaMeGusta> {
    return this.httpClient.delete<RespuestaMeGusta>(`${API_URL}/publicaciones/${id}/like`);
  }
}