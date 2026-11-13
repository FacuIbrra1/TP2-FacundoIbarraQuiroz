import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from '../../servicios/usuarios-service';
import { Autenticacion } from '../../servicios/autenticacion';
import { Usuario } from '../../models/usuario';
import { validarTextoNoVacio } from '../../validadores/publicacion';
import { mensajesDeError } from '../../api';

// Editar mi perfil (corrección del Sprint 3). Se abre desde Mi Perfil con los datos actuales.
// Como el formulario de publicación: recibe el usuario con input() y avisa con output().
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-formulario-perfil',
  styleUrl: './formulario-perfil.css',
  templateUrl: './formulario-perfil.html',
})
export class FormularioPerfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly autenticacion = inject(Autenticacion);

  usuario = input.required<Usuario>();

  guardado = output<void>();
  cancelar = output<void>();

  protected form: FormGroup = this.fb.group({});

  // La foto nueva es opcional. Como en el registro, el campo file se maneja aparte.
  protected readonly imagen = signal<File | null>(null);
  protected readonly errorImagen = signal<string | null>(null);

  protected readonly enviando = signal(false);
  protected readonly erroresServidor = signal<string[]>([]);

  // El formulario se arma acá y no arriba: recién en ngOnInit está el usuario que llega por input().
  ngOnInit(): void {
    const usuario = this.usuario();
    this.form = this.fb.group({
      nombre: [usuario.nombre, [Validators.required, validarTextoNoVacio]],
      // Un club no tiene apellido; jugador y DT, sí (como en el registro).
      apellido: [usuario.apellido, this.esClub() ? [] : [Validators.required, validarTextoNoVacio]],
      descripcion: [usuario.descripcion, Validators.maxLength(200)],
      // El campo date pide "AAAA-MM-DD": se toman los primeros 10 caracteres de la fecha que manda el back.
      fechaNacimiento: [usuario.fechaNacimiento.slice(0, 10), Validators.required],
    });
  }

  protected esClub(): boolean {
    return this.usuario().tipo === 'club';
  }

  protected esCampoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  protected alElegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    this.imagen.set(null);
    this.errorImagen.set(null);

    if (!archivo) {
      return; // Eligió y después canceló: queda la foto que tenía.
    }
    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen (JPG, PNG, WEBP…).');
    } else if (archivo.size > 2 * 1024 * 1024) {
      this.errorImagen.set('La imagen no puede pesar más de 2 MB.');
    } else {
      this.imagen.set(archivo);
    }
  }

  protected guardar() {
    if (this.form.invalid || this.errorImagen()) {
      this.form.markAllAsTouched();
      return;
    }

    // multipart/form-data, como el registro: los textos y la foto (si hay) viajan juntos.
    const valores = this.form.value;
    const datos = new FormData();
    datos.append('nombre', valores.nombre.trim());
    if (!this.esClub()) {
      datos.append('apellido', valores.apellido.trim());
    }
    datos.append('descripcion', valores.descripcion.trim());
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    const imagen = this.imagen();
    if (imagen) {
      datos.append('imagen', imagen);
    }

    this.enviando.set(true);
    this.erroresServidor.set([]);

    this.usuariosService.editarPerfil(datos).subscribe({
      next: (usuario) => {
        // Los datos nuevos quedan en la sesión: el encabezado y Mi Perfil se actualizan solos (signals).
        this.autenticacion.actualizarUsuario(usuario);
        this.enviando.set(false);
        this.guardado.emit();
      },
      error: (error) => {
        this.erroresServidor.set(mensajesDeError(error));
        this.enviando.set(false);
      },
    });
  }
}
