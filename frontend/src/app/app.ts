import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Autenticacion } from './servicios/autenticacion';
import { ModalConfirmacion } from './componentes/modal-confirmacion/modal-confirmacion';
import { mensajesDeError } from './api';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ModalConfirmacion],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  // El modal de "quedan 5 minutos" está acá, en App: así aparece en cualquier pantalla.
  protected readonly extendiendo = signal(false);
  protected readonly errorAlExtender = signal<string | null>(null);

  protected salir() {
    this.autenticacion.cerrarSesion();
    this.router.navigate(['/login']);
  }

  // "Extender sesión": pide un token nuevo con otros 15 minutos (POST /auth/refrescar).
  // Si el token ya venció, el back responde 401 y el sesionInterceptor lleva al login.
  protected extenderSesion() {
    this.extendiendo.set(true);
    this.errorAlExtender.set(null);

    this.autenticacion.refrescar().subscribe({
      next: (respuesta) => {
        this.autenticacion.actualizarToken(respuesta.token); // También cierra el modal y reinicia el contador.
        this.extendiendo.set(false);
      },
      error: (error) => {
        this.errorAlExtender.set(mensajesDeError(error)[0]);
        this.extendiendo.set(false);
      },
    });
  }

  // "Ahora no": se cierra el aviso. Cuando el token venza, el próximo pedido dará 401 y llevará al login.
  protected cerrarAviso() {
    this.errorAlExtender.set(null);
    this.autenticacion.mostrarAviso.set(false);
  }
}
