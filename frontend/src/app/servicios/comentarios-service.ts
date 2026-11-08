import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { Comentario } from '../models/comentario';

// Los pedidos de comentarios al back (en el Sprint 3 se suman comentar y editar).
@Service()
export class ComentariosService {
  private readonly httpClient = inject(HttpClient);

  // GET /publicaciones/:id/comentarios: los más recientes primero.
  listar(publicacionId: string): Observable<Comentario[]> {
    return this.httpClient.get<Comentario[]>(`${API_URL}/publicaciones/${publicacionId}/comentarios`);
  }
}