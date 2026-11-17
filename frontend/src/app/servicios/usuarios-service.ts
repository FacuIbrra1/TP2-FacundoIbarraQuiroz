import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { Usuario } from '../models/usuario';

// Los pedidos de usuarios al back: editar mi perfil (corrección del Sprint 3)
// y el dashboard del administrador (Sprint 4).
@Service()
export class UsuariosService {
  private readonly httpClient = inject(HttpClient);

  // PATCH /usuarios/mi-perfil: multipart/form-data, porque puede llevar una foto nueva.
  editarPerfil(datos: FormData): Observable<Usuario> {
    return this.httpClient.patch<Usuario>(`${API_URL}/usuarios/mi-perfil`, datos);
  }

  // ---- Sprint 4: solo administradores (el back responde 403 a cualquier otro) ----

  // GET /usuarios: todos los usuarios, habilitados y deshabilitados.
  listar(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(`${API_URL}/usuarios`);
  }

  // POST /usuarios: los mismos datos que el registro (con la imagen, por eso FormData) más el perfil.
  crear(datos: FormData): Observable<Usuario> {
    return this.httpClient.post<Usuario>(`${API_URL}/usuarios`, datos);
  }

  // DELETE /usuarios/:id: baja lógica. Devuelve el usuario con activo: false.
  deshabilitar(id: string): Observable<Usuario> {
    return this.httpClient.delete<Usuario>(`${API_URL}/usuarios/${id}`);
  }

  // POST /usuarios/:id/habilitar: alta lógica. Devuelve el usuario con activo: true.
  habilitar(id: string): Observable<Usuario> {
    return this.httpClient.post<Usuario>(`${API_URL}/usuarios/${id}/habilitar`, {});
  }
}
