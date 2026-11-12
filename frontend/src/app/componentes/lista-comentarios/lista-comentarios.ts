import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComentariosService } from '../../servicios/comentarios-service';
import { Autenticacion } from '../../servicios/autenticacion';
import { Comentario } from '../../models/comentario';
import { validarTextoNoVacio } from '../../validadores/publicacion';
import { mensajesDeError } from '../../api';

// Cuántos comentarios llegan en la primera carga y con cada "Cargar más".
const POR_PAGINA = 5;

// Los comentarios de una publicación, uno debajo del otro, los más recientes primero.
// En Mi Perfil solo se leen. En la página de la publicación (interactiva = true) además
// se puede comentar y editar los propios.
@Component({
  imports: [DatePipe, ReactiveFormsModule],
  selector: 'app-lista-comentarios',
  styleUrl: './lista-comentarios.css',
  templateUrl: './lista-comentarios.html',
})
export class ListaComentarios implements OnInit {
  private readonly comentariosService = inject(ComentariosService);
  private readonly autenticacion = inject(Autenticacion);
  private readonly fb = inject(FormBuilder);

  publicacionId = input.required<string>();
  interactiva = input(false);

  protected readonly comentarios = signal<Comentario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly cargandoMas = signal(false);
  protected readonly hayMas = signal(false);
  protected readonly error = signal<string | null>(null);

  // Comentar.
  protected formNuevo: FormGroup = this.formularioComentario('');
  protected readonly enviando = signal(false);
  protected readonly errorNuevo = signal<string | null>(null);

  // Editar: el id del comentario que se está editando (null si ninguno) y su formulario.
  protected readonly editandoId = signal<string | null>(null);
  protected formEdicion: FormGroup = this.formularioComentario('');
  protected readonly guardando = signal(false);
  protected readonly errorEdicion = signal<string | null>(null);

  ngOnInit(): void {
    this.pedirComentarios();
  }

  // Las mismas reglas que valida el back: obligatorio, sin solo espacios y hasta 500 caracteres.
  // Se arma de nuevo cada vez: vacío después de comentar, o con el texto actual al editar.
  private formularioComentario(texto: string): FormGroup {
    return this.fb.group({
      mensaje: [texto, [Validators.required, Validators.maxLength(500), validarTextoNoVacio]],
    });
  }

  // ---- Listar y "Cargar más" ----

  // Pide desde donde termina la lista (offset = los que ya se ven) y uno de más para saber si hay otra página.
  // Los nuevos se agregan al final, sin borrar los anteriores (lo pide el enunciado).
  protected pedirComentarios() {
    this.cargandoMas.set(true);
    this.comentariosService
      .listar(this.publicacionId(), this.comentarios().length, POR_PAGINA + 1)
      .subscribe({
        next: (nuevos) => {
          this.hayMas.set(nuevos.length > POR_PAGINA);
          this.comentarios.update((lista) => [...lista, ...nuevos.slice(0, POR_PAGINA)]);
          this.cargando.set(false);
          this.cargandoMas.set(false);
        },
        error: (error) => {
          this.error.set(mensajesDeError(error)[0]);
          this.cargando.set(false);
          this.cargandoMas.set(false);
        },
      });
  }

  // ---- Comentar ----

  protected comentar() {
    if (this.formNuevo.invalid) {
      this.formNuevo.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorNuevo.set(null);
    this.comentariosService.crear(this.publicacionId(), this.formNuevo.value.mensaje.trim()).subscribe({
      next: (comentario) => {
        // Es el más reciente: va primero. Como también queda primero en el back, el offset de "Cargar más" sigue bien.
        this.comentarios.update((lista) => [comentario, ...lista]);
        this.formNuevo = this.formularioComentario('');
        this.enviando.set(false);
      },
      error: (error) => {
        this.errorNuevo.set(mensajesDeError(error)[0]);
        this.enviando.set(false);
      },
    });
  }

  // ---- Editar ----

  // Solo el autor ve el botón "Editar" (el back igual lo controla: 403).
  protected esMio(comentario: Comentario): boolean {
    return comentario.autor._id === this.autenticacion.usuario()?._id;
  }

  protected empezarEdicion(comentario: Comentario) {
    this.formEdicion = this.formularioComentario(comentario.mensaje);
    this.errorEdicion.set(null);
    this.editandoId.set(comentario._id);
  }

  protected cancelarEdicion() {
    this.editandoId.set(null);
  }

  protected guardarEdicion(comentario: Comentario) {
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set(null);
    this.comentariosService.editar(comentario._id, this.formEdicion.value.mensaje.trim()).subscribe({
      next: (editado) => {
        // Se reemplaza solo ese comentario: ahora viene con modificado: true y se ve "(editado)".
        this.comentarios.update((lista) => lista.map((c) => (c._id === editado._id ? editado : c)));
        this.editandoId.set(null);
        this.guardando.set(false);
      },
      error: (error) => {
        this.errorEdicion.set(mensajesDeError(error)[0]);
        this.guardando.set(false);
      },
    });
  }

  protected esCampoInvalido(form: FormGroup): boolean {
    const campo = form.get('mensaje');
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }
}
