import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { Comentario } from '../models/comentario';

// Los pedidos de comentarios al back.
@Service()
export class ComentariosService {
  private readonly httpClient = inject(HttpClient);

  // GET /publicaciones/:id/comentarios?offset=0&limit=5: los más recientes primero, de a "limit".
  listar(publicacionId: string, offset: number, limit: number): Observable<Comentario[]> {
    return this.httpClient.get<Comentario[]>(
      `${API_URL}/publicaciones/${publicacionId}/comentarios?offset=${offset}&limit=${limit}`,
    );
  }

  // POST /publicaciones/:id/comentarios: el autor y la fecha los pone el back.
  crear(publicacionId: string, mensaje: string): Observable<Comentario> {
    return this.httpClient.post<Comentario>(`${API_URL}/publicaciones/${publicacionId}/comentarios`, {
      mensaje: mensaje,
    });
  }

  // PUT /comentarios/:id: el mensaje nuevo; el back lo marca como modificado.
  editar(comentarioId: string, mensaje: string): Observable<Comentario> {
    return this.httpClient.put<Comentario>(`${API_URL}/comentarios/${comentarioId}`, {
      mensaje: mensaje,
    });
  }
}
