import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';
import { passwordsIguales, validarPassword } from '../../validadores/password';
import { mensajesDeError } from '../../api';
import { apellidoSegunTipo, tipoSegunPerfil } from '../../validadores/registro';
import { validarDominioEmail } from '../../validadores/email';
import { UsuariosService } from '../../servicios/usuarios-service';
import { Usuario } from '../../models/usuario';
import { MostrarClave } from '../../directivas/mostrar-clave';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MostrarClave],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);
  private readonly usuariosService = inject(UsuariosService);

  // Sprint 4: el mismo formulario sirve para el alta de usuarios del dashboard ("mismos datos que el registro").
  // administrador = true: suma los radio buttons del perfil, crea la cuenta con POST /usuarios
  // y avisa al dashboard con "creado" (no inicia sesión con la cuenta nueva).
  administrador = input(false);
  creado = output<Usuario>();
  cancelar = output<void>();

  // Los tipos de cuenta de Potrero Libre (los mismos que acepta el back).
  protected readonly tipos = [
    { valor: 'jugador', titulo: 'Jugador', detalle: 'Busco club o equipo para jugar' },
    { valor: 'dt', titulo: 'Director técnico', detalle: 'Armo y dirijo equipos' },
    { valor: 'club', titulo: 'Club', detalle: 'El perfil de la institución' },
  ];

  // Sprint 4: un cuarto tipo, solo en el dashboard y solo si se eligió el perfil Administrador.
  // Es una persona (lleva apellido y fecha de nacimiento, como el jugador) que administra la red social.
  private readonly tipoAdministrador = {
    valor: 'administrador',
    titulo: 'Administrador',
    detalle: 'Administra Potrero Libre',
  };

  // Los tipos que se muestran: los tres de siempre y, en el alta de un administrador, el cuarto.
  protected tiposVisibles() {
    if (this.administrador() && this.form.get('perfil')?.value === 'administrador') {
      return [...this.tipos, this.tipoAdministrador];
    }
    return this.tipos;
  }

  protected form: FormGroup = this.fb.group(
    {
      nombre: ['', Validators.required],
      apellido: [''],
      email: ['', [Validators.required, Validators.email, validarDominioEmail]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8), validarPassword]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.maxLength(200)],
      tipo: ['', Validators.required],
      perfil: ['usuario'], // Solo se manda en el dashboard. Arranca en "usuario", el perfil de siempre.
    },
    // Validación cruzada: compara password con repetirPassword, el apellido según el tipo
    // y (Sprint 4) que el tipo Administrador vaya con el perfil Administrador.
    { validators: [passwordsIguales, apellidoSegunTipo, tipoSegunPerfil] },
  );

  // El campo file no se maneja con formControlName: la imagen se guarda aparte.
  protected readonly imagen = signal<File | null>(null);
  protected readonly errorImagen = signal<string | null>(null);

  protected readonly enviando = signal(false);
  protected readonly erroresServidor = signal<string[]>([]);

  protected esCampoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  // Un club es una institución: en lugar de nombre y apellido lleva el nombre de la institución, y en lugar de la fecha de nacimiento, la de creación.
  protected esClub(): boolean {
    return this.form.get('tipo')?.value === 'club';
  }

  protected apellidoInvalido(): boolean {
    const campo = this.form.get('apellido');
    const tocado = !!(campo && (campo.dirty || campo.touched));
    return tocado && this.form.hasError('apellidoObligatorio');
  }

  protected repetirPasswordInvalido(): boolean {
    const campo = this.form.get('repetirPassword');
    const tocado = !!(campo && (campo.dirty || campo.touched));
    return (
      tocado &&
      (this.esCampoInvalido('repetirPassword') || this.form.hasError('passwordsDistintas'))
    );
  }

  protected alElegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    this.imagen.set(null);

    if (!archivo) {
      this.errorImagen.set('La imagen de perfil es obligatoria.');
    } else if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen (JPG, PNG, WEBP…).');
    } else if (archivo.size > 2 * 1024 * 1024) {
      this.errorImagen.set('La imagen no puede pesar más de 2 MB.');
    } else {
      this.errorImagen.set(null);
      this.imagen.set(archivo);
    }
  }

  protected registrarse() {
    const imagen = this.imagen();

    if (!imagen && !this.errorImagen()) {
      this.errorImagen.set('La imagen de perfil es obligatoria.');
    }
    if (this.form.invalid || !imagen) {
      this.form.markAllAsTouched(); // Muestra los mensajes de todos los campos.
      return;
    }

    // multipart/form-data: los datos y la imagen viajan juntos.
    // repetirPassword no se manda: es solo del formulario.
    const valores = this.form.value;
    const datos = new FormData();
    datos.append('nombre', valores.nombre.trim());
    if (!this.esClub()) {
      datos.append('apellido', valores.apellido.trim()); // Un club no tiene apellido.
    }
    datos.append('email', valores.email.trim());
    datos.append('username', valores.username.trim());
    datos.append('password', valores.password);
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('descripcion', valores.descripcion.trim());
    datos.append('tipo', valores.tipo);
    datos.append('imagen', imagen);

    this.enviando.set(true);
    this.erroresServidor.set([]);

    if (this.administrador()) {
      this.crearDesdeDashboard(datos);
      return;
    }

    this.autenticacion.registro(datos).subscribe({
      next: (respuesta) => {
        this.autenticacion.guardarSesion(respuesta);
        this.router.navigate(['/mi-perfil']);
      },
      error: (error) => {
        this.erroresServidor.set(mensajesDeError(error));
        this.enviando.set(false);
      },
    });
  }

  // Sprint 4: el alta del administrador. El perfil lo eligió con los radio buttons.
  // La sesión sigue siendo la del administrador: la cuenta nueva se le pasa al dashboard.
  private crearDesdeDashboard(datos: FormData) {
    datos.append('perfil', this.form.value.perfil);

    this.usuariosService.crear(datos).subscribe({
      next: (usuario) => {
        this.enviando.set(false);
        this.creado.emit(usuario);
      },
      error: (error) => {
        this.erroresServidor.set(mensajesDeError(error));
        this.enviando.set(false);
      },
    });
  }
}
