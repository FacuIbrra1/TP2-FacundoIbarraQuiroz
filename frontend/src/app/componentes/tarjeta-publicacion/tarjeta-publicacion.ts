import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion';
import { Autenticacion } from '../../servicios/autenticacion';
import { ListaComentarios } from '../lista-comentarios/lista-comentarios';

// Cada publicación es un componente (lo pide el enunciado).
// Recibe la publicación con input() y avisa al padre con output(), como el Hijo del ejemplo de clase:
// la tarjeta no llama al back, de eso se encarga la página que la muestra.
@Component({
  imports: [DatePipe, RouterLink, ListaComentarios],
  selector: 'app-tarjeta-publicacion',
  styleUrl: './tarjeta-publicacion.css',
  templateUrl: './tarjeta-publicacion.html',
})
export class TarjetaPublicacion {
  private readonly autenticacion = inject(Autenticacion);

  publicacion = input.required<Publicacion>();
  meGusta = input(false); // Si el usuario de la sesión ya le dio me gusta.
  acciones = input(true); // false: sin botones, solo la cantidad de me gusta (Mi Perfil).
  mostrarComentarios = input(false); // true: muestra los comentarios debajo (Mi Perfil y la página de la publicación).
  grande = input(false); // true: la página de una publicación (más grande, y se puede comentar).

  darMeGusta = output<void>();
  quitarMeGusta = output<void>();
  borrar = output<void>();
  editar = output<void>(); // Corrección del Sprint 3.

  protected alTocarMeGusta() {
    if (this.meGusta()) {
      this.quitarMeGusta.emit();
    } else {
      this.darMeGusta.emit();
    }
  }

  // Solo la puede editar quien la publicó (el back igual lo controla: 403).
  protected esAutor(): boolean {
    return this.autenticacion.usuario()?._id === this.publicacion().autor._id;
  }

  // Solo la puede borrar quien la publicó o un administrador (lo mismo que controla el back).
  protected puedeBorrar(): boolean {
    const usuario = this.autenticacion.usuario();
    if (!usuario) {
      return false;
    }
    return usuario._id === this.publicacion().autor._id || usuario.perfil === 'administrador';
  }

  protected nombreDelTipo(tipo: string): string {
    if (tipo === 'dt') {
      return 'Director técnico';
    }
    if (tipo === 'club') {
      return 'Club';
    }
    return 'Jugador';
  }

  protected nombreDeCategoria(categoria: string): string {
    if (categoria === 'busco-club') {
      return 'Busco club';
    }
    if (categoria === 'busco-jugadores') {
      return 'Busco jugadores';
    }
    if (categoria === 'prueba') {
      return 'Prueba';
    }
    return 'General';
  }
}