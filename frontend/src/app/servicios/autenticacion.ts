import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { RespuestaAutenticacion, RespuestaRefrescar, Sesion, Usuario } from '../models/usuario';

// El nombre con el que se guarda la sesión en el localStorage del navegador.
const CLAVE_SESION = 'sesionPotreroLibre';

// El token vence a los 15 minutos (lo decide el back). A los 10 minutos de obtenerlo,
// se avisa que quedan 5 y se ofrece extender la sesión.
// Para la presentación con el token de 30 segundos, cambio a 20 * 1000 (aviso a los 20s).
const AVISO_MS = 20 * 1000; // Modificar este AVISO correccion 

@Service()
export class Autenticacion {
  private readonly httpClient = inject(HttpClient);

  readonly usuario = signal<Usuario | null>(null);
  readonly token = signal<string | null>(null);

  // true: App muestra el modal de "quedan 5 minutos".
  readonly mostrarAviso = signal(false);
  // true: el login avisa que la sesión venció (lo prende el sesionInterceptor ante un 401).
  readonly sesionVencida = signal(false);

  private inicio = 0; // Cuándo se obtuvo el token (Date.now()).
  private contador: number | undefined; // El setTimeout del aviso, para poder cancelarlo.

  // La sesión se guarda en el navegador (como 'userMiApp' en el ejemplo de guards),
  // así no se pierde al recargar la página. Al arrancar, se recupera de ahí y se vuelve a
  // programar el aviso con el tiempo que le queda. Si el token ya no sirve, lo detectan
  // la pantalla de cargando (autorizar) o el primer pedido que dé 401.
  constructor() {
    const guardada = localStorage.getItem(CLAVE_SESION);
    if (guardada) {
      const sesion: Sesion = JSON.parse(guardada);
      this.usuario.set(sesion.usuario);
      this.token.set(sesion.token);
      this.inicio = sesion.inicio;
      this.programarAviso();
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

  // POST /auth/autorizar: 200 con los datos del usuario si el token sirve; 401 si no.
  // No lleva body: el token lo agrega el tokenInterceptor.
  autorizar(): Observable<Usuario> {
    return this.httpClient.post<Usuario>(`${API_URL}/auth/autorizar`, {});
  }

  // POST /auth/refrescar: un token nuevo, con otros 15 minutos.
  refrescar(): Observable<RespuestaRefrescar> {
    return this.httpClient.post<RespuestaRefrescar>(`${API_URL}/auth/refrescar`, {});
  }

  // Después del login o el registro: guarda todo y arranca el contador de 10 minutos.
  guardarSesion(respuesta: RespuestaAutenticacion) {
    this.usuario.set(respuesta.usuario);
    this.token.set(respuesta.token);
    this.inicio = Date.now();
    this.sesionVencida.set(false);
    this.guardarEnNavegador();
    this.programarAviso();
  }

  // Después de autorizar: los datos actualizados del usuario. El contador no cambia.
  actualizarUsuario(usuario: Usuario) {
    this.usuario.set(usuario);
    this.guardarEnNavegador();
  }

  // Después de refrescar: el token nuevo, y el contador vuelve a empezar.
  actualizarToken(token: string) {
    this.token.set(token);
    this.inicio = Date.now();
    this.guardarEnNavegador();
    this.programarAviso();
  }

  cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    this.usuario.set(null);
    this.token.set(null);
    clearTimeout(this.contador); // Sin sesión, no hay nada que avisar.
    this.mostrarAviso.set(false);
  }

  private guardarEnNavegador() {
    const sesion: Sesion = { token: this.token()!, usuario: this.usuario()!, inicio: this.inicio };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  // setTimeout muestra el aviso cuando se cumplen los 10 minutos.
  // clearTimeout cancela el anterior: si no, al extender la sesión quedarían dos contadores.
  // Si ya pasaron los 10 minutos (por ejemplo, al recargar en el minuto 12), "falta" es negativo y setTimeout lo muestra enseguida.
  private programarAviso() {
    clearTimeout(this.contador);
    this.mostrarAviso.set(false);
    
    const falta = this.inicio + AVISO_MS - Date.now();
    this.contador = setTimeout(() => this.mostrarAviso.set(true), falta);
  }
}
