import { Component, inject, OnInit, signal } from '@angular/core';
import { UsuariosService } from '../../servicios/usuarios-service';
import { Autenticacion } from '../../servicios/autenticacion';
import { Usuario } from '../../models/usuario';
import { Registro } from '../registro/registro';
import { ModalConfirmacion } from '../modal-confirmacion/modal-confirmacion';
import { TipoCuentaPipe } from '../../pipes/tipo-cuenta';
import { EdadPipe } from '../../pipes/edad';
import { ImagenRespaldo } from '../../directivas/imagen-respaldo';
import { mensajesDeError } from '../../api';

// Sprint 4: dashboard/usuarios (solo administradores).
// Lista los usuarios, da de alta uno nuevo (con el formulario del registro, en modo administrador)
// y los deshabilita o habilita, siempre con un modal de confirmación.
@Component({
  imports: [Registro, ModalConfirmacion, TipoCuentaPipe, EdadPipe, ImagenRespaldo],
  selector: 'app-dashboard-usuarios',
  styleUrl: './dashboard-usuarios.css',
  templateUrl: './dashboard-usuarios.html',
})
export class DashboardUsuarios implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly autenticacion = inject(Autenticacion);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  // El formulario de alta y el aviso de "usuario creado".
  protected readonly creando = signal(false);
  protected readonly aviso = signal<string | null>(null);

  // El usuario que se va a habilitar o deshabilitar (el modal se muestra mientras no sea null).
  protected readonly usuarioACambiar = signal<Usuario | null>(null);
  protected readonly cambiando = signal(false);
  protected readonly errorAlCambiar = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajesDeError(error)[0]);
        this.cargando.set(false);
      },
    });
  }

  // El administrador no puede deshabilitarse a sí mismo (el back también lo rechaza con 400).
  protected esYo(usuario: Usuario): boolean {
    return usuario._id === this.autenticacion.usuario()?._id;
  }

  protected cantidadDeshabilitados(): number {
    return this.usuarios().filter((usuario) => !usuario.activo).length;
  }

  // ---- Alta ----

  protected empezarAlta() {
    this.aviso.set(null);
    this.creando.set(true);
  }

  // El formulario avisó que creó la cuenta: se cierra y se vuelve a pedir el listado (queda en su lugar, por orden alfabético).
  protected alCrear(usuario: Usuario) {
    this.creando.set(false);
    const perfil = usuario.perfil === 'administrador' ? 'administrador' : 'usuario';
    this.aviso.set(`¡Listo! Creamos la cuenta de @${usuario.username} con perfil ${perfil}.`);
    this.cargar();
  }

  // ---- Habilitar y deshabilitar (con modal) ----

  protected pedirCambio(usuario: Usuario) {
    this.aviso.set(null);
    this.errorAlCambiar.set(null);
    this.usuarioACambiar.set(usuario);
  }

  protected cancelarCambio() {
    this.usuarioACambiar.set(null);
  }

  protected confirmarCambio() {
    const usuario = this.usuarioACambiar();
    if (!usuario) {
      return;
    }

    // Si está habilitado, se deshabilita (DELETE); si no, se habilita (POST .../habilitar).
    const pedido = usuario.activo
      ? this.usuariosService.deshabilitar(usuario._id)
      : this.usuariosService.habilitar(usuario._id);

    this.cambiando.set(true);
    pedido.subscribe({
      next: (actualizado) => {
        // Se reemplaza solo esa fila con lo que devolvió el back (como al editar una publicación).
        this.usuarios.set(this.usuarios().map((u) => (u._id === actualizado._id ? actualizado : u)));
        this.cambiando.set(false);
        this.usuarioACambiar.set(null);
      },
      error: (error) => {
        this.errorAlCambiar.set(mensajesDeError(error)[0]);
        this.cambiando.set(false);
      },
    });
  }

  // Los textos del modal, según lo que se va a hacer.
  protected tituloModal(usuario: Usuario): string {
    return usuario.activo ? `¿Deshabilitar a @${usuario.username}?` : `¿Habilitar a @${usuario.username}?`;
  }

  protected mensajeModal(usuario: Usuario): string {
    if (usuario.activo) {
      return 'No va a poder ingresar a Potrero Libre: al intentarlo, se le avisa que su cuenta está deshabilitada.';
    }
    return 'Va a poder volver a ingresar a Potrero Libre con su usuario y contraseña.';
  }
}
