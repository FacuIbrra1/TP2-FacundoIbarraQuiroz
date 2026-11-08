import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ComentariosService } from '../../servicios/comentarios-service';
import { Comentario } from '../../models/comentario';
import { mensajesDeError } from '../../api';

// Los comentarios de una publicación, uno debajo del otro.
// Recibe el id de la publicación y los pide al back cuando se muestra.
@Component({
  imports: [DatePipe],
  selector: 'app-lista-comentarios',
  styleUrl: './lista-comentarios.css',
  templateUrl: './lista-comentarios.html',
})

export class ListaComentarios implements OnInit {
  private readonly comentariosService = inject(ComentariosService);

  publicacionId = input.required<string>();

  protected readonly comentarios = signal<Comentario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.comentariosService.listar(this.publicacionId()).subscribe({
      next: (comentarios) => {
        this.comentarios.set(comentarios);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajesDeError(error)[0]);
        this.cargando.set(false);
      },
    });
  }
}