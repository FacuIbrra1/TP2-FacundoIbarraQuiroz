import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { Usuario } from '../models/usuario';

// Los pedidos de usuarios al back (corrección del Sprint 3: editar mi perfil).
@Service()
export class UsuariosService {
  private readonly httpClient = inject(HttpClient);

  // PATCH /usuarios/mi-perfil: multipart/form-data, porque puede llevar una foto nueva.
  editarPerfil(datos: FormData): Observable<Usuario> {
    return this.httpClient.patch<Usuario>(`${API_URL}/usuarios/mi-perfil`, datos);
  }
}
