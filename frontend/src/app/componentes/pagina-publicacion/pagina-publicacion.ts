import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PublicacionesService } from '../../servicios/publicaciones-service';
import { Publicacion } from '../../models/publicacion';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { ModalConfirmacion } from '../modal-confirmacion/modal-confirmacion';
import { FormularioPublicacion } from '../formulario-publicacion/formulario-publicacion';
import { mensajesDeError } from '../../api';

// La página de una publicación (/publicacion/:id): la muestra grande, con sus comentarios
// debajo. Ahí se puede comentar, editar los comentarios propios, dar me gusta y borrarla.
@Component({
  imports: [RouterLink, TarjetaPublicacion, ModalConfirmacion, FormularioPublicacion],
  selector: 'app-pagina-publicacion',
  styleUrl: './pagina-publicacion.css',
  templateUrl: './pagina-publicacion.html',
})
export class PaginaPublicacion implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicacionesService = inject(PublicacionesService);

  protected readonly publicacion = signal<Publicacion | null>(null);
  protected readonly meGusta = signal(false);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly errorAccion = signal<string | null>(null);

  protected readonly pidiendoBorrar = signal(false);
  protected readonly borrando = signal(false);
  protected readonly errorAlBorrar = signal<string | null>(null);

  private suscripcion!: Subscription;

  // Como el Detalle de la clase 2: el id llega por la URL y se lee con ActivatedRoute.
  ngOnInit(): void {
    this.suscripcion = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.cargar(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  private cargar(id: string) {
    this.cargando.set(true);
    this.error.set(null);

    this.publicacionesService.buscarPorId(id).subscribe({
      next: (publicacion) => {
        this.publicacion.set(publicacion);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajesDeError(error)[0]); // Por ejemplo, 404 "La publicación no existe".
        this.cargando.set(false);
      },
    });

    // Para mostrar ♥ o ♡, igual que en el listado.
    this.publicacionesService.misLikes().subscribe({
      next: (ids) => this.meGusta.set(ids.includes(id)),
      error: () => this.meGusta.set(false),
    });
  }

  // ---- Me gusta ----

  protected darMeGusta(publicacion: Publicacion) {
    this.errorAccion.set(null);
    this.publicacionesService.darMeGusta(publicacion._id).subscribe({
      next: (respuesta) => {
        this.meGusta.set(true);
        this.publicacion.set({ ...publicacion, cantidadLikes: respuesta.cantidadLikes });
      },
      error: (error) => this.errorAccion.set(mensajesDeError(error)[0]),
    });
  }

  protected quitarMeGusta(publicacion: Publicacion) {
    this.errorAccion.set(null);
    this.publicacionesService.quitarMeGusta(publicacion._id).subscribe({
      next: (respuesta) => {
        this.meGusta.set(false);
        this.publicacion.set({ ...publicacion, cantidadLikes: respuesta.cantidadLikes });
      },
      error: (error) => this.errorAccion.set(mensajesDeError(error)[0]),
    });
  }

  // ---- Editar (corrección del Sprint 3) ----

  protected readonly editando = signal(false);

  protected alEditar(editada: Publicacion) {
    this.publicacion.set(editada);
    this.editando.set(false);
  }

  // ---- Borrar (con modal) ----

  protected pedirBorrar() {
    this.errorAlBorrar.set(null);
    this.pidiendoBorrar.set(true);
  }

  protected cancelarBorrar() {
    this.pidiendoBorrar.set(false);
  }

  // Borrada, la página ya no tiene nada que mostrar: vuelve al listado.
  protected confirmarBorrar(publicacion: Publicacion) {
    this.borrando.set(true);
    this.publicacionesService.borrar(publicacion._id).subscribe({
      next: () => {
        this.borrando.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.borrando.set(false);
        this.errorAlBorrar.set(mensajesDeError(error)[0]);
      },
    });
  }
}
