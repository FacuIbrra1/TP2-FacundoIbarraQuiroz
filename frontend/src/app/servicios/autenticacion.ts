import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { RespuestaAutenticacion, Usuario } from '../models/usuario';

// El nombre con el que se guarda la sesión en el localStorage del navegador.
const CLAVE_SESION = 'sesionPotreroLibre';

@Service()
export class Autenticacion {
  private readonly httpClient = inject(HttpClient);

  readonly usuario = signal<Usuario | null>(null);
  readonly token = signal<string | null>(null);

  // La sesión se guarda en el navegador (como 'userMiApp' en el ejemplo de guards),
  // así no se pierde al recargar la página. Al arrancar, se recupera de ahí.
  // Validar que el token no esté vencido es del Sprint 3 (pantalla de cargando).
  constructor() {
    const sesion = localStorage.getItem(CLAVE_SESION);
    if (sesion) {
      const respuesta: RespuestaAutenticacion = JSON.parse(sesion);
      this.usuario.set(respuesta.usuario);
      this.token.set(respuesta.token);
    }
  }

  // multipart/form-data: FormData lleva los datos y la imagen juntos.
  registro(datos: FormData): Observable<RespuestaAutenticacion> {
    return this.httpClient.post<RespuestaAutenticacion>(`${API_URL}/auth/registro`, datos);
  }

  // usuario: el correo o el nombre de usuario (el back acepta los dos).
  login(usuario: string, password: string): Observable<RespuestaAutenticacion> {
    return this.httpClient.post<RespuestaAutenticacion>(`${API_URL}/auth/login`, {
      usuario: usuario,
      password: password,
    });
  }

  guardarSesion(respuesta: RespuestaAutenticacion) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(respuesta));
    this.usuario.set(respuesta.usuario);
    this.token.set(respuesta.token);
  }

  cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    this.usuario.set(null);
    this.token.set(null);
  }
}
