import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';
import { PublicacionesService } from '../../servicios/publicaciones-service';
import { Publicacion } from '../../models/publicacion';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { mensajesDeError } from '../../api';

@Component({
  imports: [DatePipe, RouterLink, TarjetaPublicacion],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  protected readonly autenticacion = inject(Autenticacion);
  private readonly publicacionesService = inject(PublicacionesService);

  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly cargando = signal(false);
  protected readonly erroresServidor = signal<string[]>([]);

  ngOnInit(): void {
    const usuario = this.autenticacion.usuario();
    if (!usuario) {
      return; // Sin sesión no se pide nada (los guards llegan en el Sprint 3).
    }

    // Mis últimas 3: el mismo listado de la página de publicaciones, filtrado por mi id.
    this.cargando.set(true);
    this.publicacionesService
      .listar({ orden: 'fecha', offset: 0, limit: 3, usuario: usuario._id })
      .subscribe({
        next: (publicaciones) => {
          this.publicaciones.set(publicaciones);
          this.cargando.set(false);
        },
        error: (error) => {
          this.erroresServidor.set(mensajesDeError(error));
          this.cargando.set(false);
        },
      });
  }

  // Un club muestra la fecha de creación (se guarda en fechaNacimiento).
  protected esClub(): boolean {
    return this.autenticacion.usuario()?.tipo === 'club';
  }

  protected nombreDelTipo(tipo: string | undefined): string {
    if (tipo === 'dt') {
      return 'Director técnico';
    }
    if (tipo === 'club') {
      return 'Club';
    }
    return 'Jugador';
  }
}