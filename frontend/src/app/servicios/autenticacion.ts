import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { RespuestaAutenticacion, RespuestaRefrescar, Sesion, Usuario } from '../models/usuario';

// El nombre con el que se guarda la sesión en el localStorage del navegador.
const CLAVE_SESION = 'sesionPotreroLibre';

// Cuánto antes de que venza el token aparece el aviso (corrección del Sprint 3).
// El token dura 15 minutos: el aviso sale cuando quedan 5.
// Para la presentación (token de '1m' en el back): 30 * 1000, el aviso sale cuando quedan 30 segundos.
const MARGEN_AVISO_MS = 30 * 1000; // 5 * 60 * 1000;

@Service()
export class Autenticacion {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  readonly usuario = signal<Usuario | null>(null);
  readonly token = signal<string | null>(null);

  // true: App muestra el modal de "tu sesión está por vencer".
  readonly mostrarAviso = signal(false);
  // Cuántos segundos le quedan al token (el modal los muestra como "4:59").
  readonly segundosRestantes = signal(0);
  // true: el login avisa que la sesión venció.
  readonly sesionVencida = signal(false);

  private vence = 0; // Cuándo vence el token, en milisegundos (lo manda el back).
  private reloj: number | undefined; // El setInterval que revisa la sesión cada segundo.
  private avisoCerrado = false; // true si eligió "Ahora no": con este token no se vuelve a mostrar.

  // La sesión se guarda en el navegador (como 'userMiApp' en el ejemplo de guards),
  // así no se pierde al recargar la página. Al arrancar, se recupera de ahí.
  constructor() {
    const guardada = localStorage.getItem(CLAVE_SESION);
    if (!guardada) {
      return;
    }

    const sesion: Sesion = JSON.parse(guardada);
    // Si el token ya venció mientras la app estaba cerrada (o es una sesión vieja, sin "vence"),
    // no sirve: se descarta y el login avisa que hay que volver a entrar.
    if (!sesion.vence || sesion.vence <= Date.now()) {
      localStorage.removeItem(CLAVE_SESION);
      this.sesionVencida.set(true);
      return;
    }

    this.usuario.set(sesion.usuario);
    this.token.set(sesion.token);
    this.vence = sesion.vence;
    this.vigilarSesion();
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

  // Después del login o el registro: guarda todo y empieza a vigilar el vencimiento.
  guardarSesion(respuesta: RespuestaAutenticacion) {
    this.usuario.set(respuesta.usuario);
    this.token.set(respuesta.token);
    this.vence = respuesta.vence;
    this.sesionVencida.set(false);
    this.guardarEnNavegador();
    this.vigilarSesion();
  }

  // Después de autorizar o de editar el perfil: los datos actualizados del usuario.
  actualizarUsuario(usuario: Usuario) {
    this.usuario.set(usuario);
    this.guardarEnNavegador();
  }

  // Después de refrescar: el token nuevo y su vencimiento. El aviso vuelve a esperar.
  actualizarToken(respuesta: RespuestaRefrescar) {
    this.token.set(respuesta.token);
    this.vence = respuesta.vence;
    this.guardarEnNavegador();
    this.vigilarSesion();
  }

  // "Ahora no" en el modal: se cierra y no vuelve a aparecer con este token.
  // Cuando venza, revisarSesion() lleva al login.
  cerrarAviso() {
    this.avisoCerrado = true;
    this.mostrarAviso.set(false);
  }

  cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    this.usuario.set(null);
    this.token.set(null);
    clearInterval(this.reloj); // Sin sesión, no hay nada que vigilar.
    this.mostrarAviso.set(false);
  }

  private guardarEnNavegador() {
    const sesion: Sesion = { token: this.token()!, usuario: this.usuario()!, vence: this.vence };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  // Corrección del Sprint 3: en vez de un setTimeout de 10 minutos, una vez por segundo se compara
  // el reloj real (Date.now()) con el vencimiento del token. Si la pestaña quedó en segundo plano
  // o la compu se suspendió, el navegador frena los temporizadores; al volver, en el próximo
  // segundo la app ve cuánto falta de verdad y muestra el aviso, o cierra la sesión si ya venció.
  private vigilarSesion() {
    clearInterval(this.reloj); // Si había un reloj de un token anterior, se cancela.
    this.mostrarAviso.set(false);
    this.avisoCerrado = false;
    this.revisarSesion();
    this.reloj = setInterval(() => this.revisarSesion(), 1000);
  }

  private revisarSesion() {
    const restante = this.vence - Date.now();

    if (restante <= 0) {
      // El token venció: se cierra la sesión y se va al login con el aviso.
      this.cerrarSesion();
      this.sesionVencida.set(true);
      this.router.navigate(['/login']);
      return;
    }

    this.segundosRestantes.set(Math.ceil(restante / 1000));
    if (restante <= MARGEN_AVISO_MS && !this.avisoCerrado) {
      this.mostrarAviso.set(true);
    }
  }
}
