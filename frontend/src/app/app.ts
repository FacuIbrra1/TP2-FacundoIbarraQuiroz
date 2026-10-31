import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Autenticacion } from './servicios/autenticacion';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  protected salir() {
    this.autenticacion.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
