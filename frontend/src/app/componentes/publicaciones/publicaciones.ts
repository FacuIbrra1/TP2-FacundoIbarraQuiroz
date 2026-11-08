import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';
import { PublicacionesService } from '../../servicios/publicaciones-service';
import { Publicacion } from '../../models/publicacion';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { ModalConfirmacion } from '../modal-confirmacion/modal-confirmacion';
import { mensajesDeError } from '../../api';
import { FormularioPublicacion } from '../formulario-publicacion/formulario-publicacion';

// Cuántas publicaciones se muestran por página.
const POR_PAGINA = 5;

@Component({
  imports: [RouterLink, TarjetaPublicacion, ModalConfirmacion, FormularioPublicacion],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})
export class Publicaciones implements OnInit {
  protected readonly autenticacion = inject(Autenticacion);
  private readonly publicacionesService = inject(PublicacionesService);

  // El valor es el que entiende el back; '' quiere decir todas.
  protected readonly categorias = [
    { valor: '', nombre: 'Todas' },
    { valor: 'general', nombre: 'General' },
    { valor: 'busco-club', nombre: 'Busco club' },
    { valor: 'busco-jugadores', nombre: 'Busco jugadores' },
    { valor: 'prueba', nombre: 'Prueba' },
  ];

  // Lo que eligió el usuario: con cada cambio se vuelve a pedir el listado.
  protected readonly orden = signal('fecha'); // Por defecto, las más nuevas (lo pide el enunciado).
  protected readonly categoria = signal('');
  protected readonly pagina = signal(0); // 0 es la primera.
  protected readonly hayMas = signal(false);

  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly idsMeGusta = signal<string[]>([]); // Las que ya tienen mi me gusta.
  protected readonly cargando = signal(false);
  protected readonly erroresServidor = signal<string[]>([]); // Si falla el listado.
  protected readonly erroresAccion = signal<string[]>([]); // Si falla un me gusta.

  // El modal de borrar: se muestra mientras haya una publicación elegida.
  protected readonly publicacionABorrar = signal<Publicacion | null>(null);
  protected readonly borrando = signal(false);
  protected readonly errorAlBorrar = signal<string | null>(null);

  // El formulario para publicar: se abre con el botón "+ Publicar".
  protected readonly formularioAbierto = signal(false);
  protected readonly avisoPublicada = signal(false);

  ngOnInit(): void {
    // Sin sesión no se pide nada: el back respondería 401 (los guards llegan en el Sprint 3).
    if (this.autenticacion.usuario()) {
      this.cargarMisMeGusta();
      this.cargar();
    }
  }

  // ---- Orden, filtro y paginado ----

  protected cambiarOrden(orden: string) {
    this.orden.set(orden);
    this.pagina.set(0); // Con otro orden, se vuelve a la primera página.
    this.cargar();
  }

  protected cambiarCategoria(categoria: string) {
    this.categoria.set(categoria);
    this.pagina.set(0);
    this.cargar();
  }

  protected paginaAnterior() {
    this.pagina.update((pagina) => pagina - 1);
    this.cargar();
  }

  protected paginaSiguiente() {
    this.pagina.update((pagina) => pagina + 1);
    this.cargar();
  }

  // Pide una publicación de más: si llega, hay otra página. Así el back no tiene que mandar el total.
  private cargar() {
    this.cargando.set(true);
    this.erroresServidor.set([]);
    this.erroresAccion.set([]);
    this.avisoPublicada.set(false);

    this.publicacionesService
      .listar({
        orden: this.orden(),
        categoria: this.categoria(),
        offset: this.pagina() * POR_PAGINA,
        limit: POR_PAGINA + 1,
      })
      .subscribe({
        next: (publicaciones) => {
          // Si borré la única publicación de la última página, vuelvo a la anterior.
          if (publicaciones.length === 0 && this.pagina() > 0) {
            this.pagina.update((pagina) => pagina - 1);
            this.cargar();
            return;
          }
          this.hayMas.set(publicaciones.length > POR_PAGINA);
          this.publicaciones.set(publicaciones.slice(0, POR_PAGINA));
          this.cargando.set(false);
        },
        error: (error) => {
          this.erroresServidor.set(mensajesDeError(error));
          this.cargando.set(false);
        },
      });
  }


  // ---- Publicar ----

  protected abrirFormulario() {
    this.formularioAbierto.set(true);
  }

  protected cerrarFormulario() {
    this.formularioAbierto.set(false);
  }

  // Se cierra el formulario y se vuelve a las más nuevas, sin filtro: la nueva queda primera.
  protected alPublicar() {
    this.formularioAbierto.set(false);
    this.orden.set('fecha');
    this.categoria.set('');
    this.pagina.set(0);
    this.cargar();
    this.avisoPublicada.set(true);
  }


  // ---- Me gusta ----

  private cargarMisMeGusta() {
    this.publicacionesService.misLikes().subscribe({
      next: (ids) => this.idsMeGusta.set(ids),
      // Si falla, los corazones quedan vacíos: el error ya lo muestra el listado.
      error: () => this.idsMeGusta.set([]),
    });
  }

  protected leGusta(publicacion: Publicacion): boolean {
    return this.idsMeGusta().includes(publicacion._id);
  }

  protected darMeGusta(publicacion: Publicacion) {
    this.publicacionesService.darMeGusta(publicacion._id).subscribe({
      next: (respuesta) => {
        this.idsMeGusta.update((ids) => [...ids, publicacion._id]);
        this.actualizarCantidad(publicacion._id, respuesta.cantidadLikes);
      },
      error: (error) => this.errorEnMeGusta(error),
    });
  }

  protected quitarMeGusta(publicacion: Publicacion) {
    this.publicacionesService.quitarMeGusta(publicacion._id).subscribe({
      next: (respuesta) => {
        this.idsMeGusta.update((ids) => ids.filter((id) => id !== publicacion._id));
        this.actualizarCantidad(publicacion._id, respuesta.cantidadLikes);
      },
      error: (error) => this.errorEnMeGusta(error),
    });
  }

  // Cambia solo el número de esa publicación: el orden de la lista no salta mientras el usuario la mira.
  private actualizarCantidad(id: string, cantidadLikes: number) {
    this.publicaciones.update((lista) =>
      lista.map((publicacion) =>
        publicacion._id === id ? { ...publicacion, cantidadLikes: cantidadLikes } : publicacion,
      ),
    );
  }

  // Por ejemplo, un 409 porque ya le había dado me gusta desde otra pestaña:
  // muestra el mensaje y vuelve a pedir todo para quedar igual que el back.
  private errorEnMeGusta(error: HttpErrorResponse) {
    this.cargarMisMeGusta();
    this.cargar();
    this.erroresAccion.set(mensajesDeError(error));
  }

  // ---- Borrar (con modal) ----

  protected pedirBorrar(publicacion: Publicacion) {
    this.errorAlBorrar.set(null);
    this.publicacionABorrar.set(publicacion);
  }

  protected cancelarBorrar() {
    this.publicacionABorrar.set(null);
  }

  protected confirmarBorrar() {
    const publicacion = this.publicacionABorrar();
    if (!publicacion) {
      return;
    }

    this.borrando.set(true);
    this.publicacionesService.borrar(publicacion._id).subscribe({
      next: () => {
        this.borrando.set(false);
        this.publicacionABorrar.set(null);
        this.cargar(); // La lista se vuelve a pedir: la borrada ya no viene.
      },
      error: (error) => {
        this.borrando.set(false);
        this.errorAlBorrar.set(mensajesDeError(error)[0]);
      },
    });
  }
}