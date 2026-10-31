import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { RespuestaAutenticacion, Usuario } from '../models/usuario';

@Service()
export class Autenticacion {
  private readonly httpClient = inject(HttpClient);

  // La sesión vive en memoria: al recargar la página se pierde.
  // En el Sprint 3 se guarda en el navegador y se valida el token al iniciar.
  readonly usuario = signal<Usuario | null>(null);
  readonly token = signal<string | null>(null);

  // multipart/form-data: FormData lleva los datos y la imagen juntos.
  registro(datos: FormData): Observable<RespuestaAutenticacion> {
    return this.httpClient.post<RespuestaAutenticacion>(`${API_URL}/auth/registro`, datos);
  }

  login(email: string, password: string): Observable<RespuestaAutenticacion> {
    return this.httpClient.post<RespuestaAutenticacion>(`${API_URL}/auth/login`, {
      email: email,
      password: password,
    });
  }

  guardarSesion(respuesta: RespuestaAutenticacion) {
    this.usuario.set(respuesta.usuario);
    this.token.set(respuesta.token);
  }

  cerrarSesion() {
    this.usuario.set(null);
    this.token.set(null);
  }
}
