import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { ComentariosPorDia, ComentariosPorPublicacion, PublicacionesPorUsuario } from '../models/estadistica';

// Sprint 4: los datos de los tres gráficos del dashboard. desde y hasta: 'AAAA-MM-DD'.
@Service()
export class EstadisticasService {
  private readonly httpClient = inject(HttpClient);

  publicacionesPorUsuario(desde: string, hasta: string): Observable<PublicacionesPorUsuario[]> {
    return this.httpClient.get<PublicacionesPorUsuario[]>(
      `${API_URL}/estadisticas/publicaciones-por-usuario?desde=${desde}&hasta=${hasta}`,
    );
  }

  comentariosPorDia(desde: string, hasta: string): Observable<ComentariosPorDia> {
    return this.httpClient.get<ComentariosPorDia>(
      `${API_URL}/estadisticas/comentarios-por-dia?desde=${desde}&hasta=${hasta}`,
    );
  }

  comentariosPorPublicacion(desde: string, hasta: string): Observable<ComentariosPorPublicacion[]> {
    return this.httpClient.get<ComentariosPorPublicacion[]>(
      `${API_URL}/estadisticas/comentarios-por-publicacion?desde=${desde}&hasta=${hasta}`,
    );
  }
}
