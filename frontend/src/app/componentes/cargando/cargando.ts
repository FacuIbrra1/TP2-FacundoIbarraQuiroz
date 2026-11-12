import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';

// La pantalla de cargando: es la ruta inicial de la app. Mientras se ve el spinner,
// se valida el token contra POST /auth/autorizar. Si sirve, a publicaciones; si no, al login.
@Component({
  imports: [],
  selector: 'app-cargando',
  styleUrl: './cargando.css',
  templateUrl: './cargando.html',
})
export class Cargando implements OnInit {
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Sin token guardado no hay nada que validar.
    if (!this.autenticacion.token()) {
      this.router.navigate(['/login']);
      return;
    }

    this.autenticacion.autorizar().subscribe({
      next: (usuario) => {
        this.autenticacion.actualizarUsuario(usuario); // Los datos frescos del back.
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        // Token vencido o inválido (401), o el back no responde: hay que volver a ingresar.
        this.autenticacion.cerrarSesion();
        this.router.navigate(['/login']);
      },
    });
  }
}
