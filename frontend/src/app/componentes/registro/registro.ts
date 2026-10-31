import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';
import { passwordsIguales, validarPassword } from '../../validadores/password';
import { mensajesDeError } from '../../api';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  // Los tipos de cuenta de Potrero Libre (los mismos que acepta el back).
  protected readonly tipos = [
    { valor: 'jugador', titulo: 'Jugador', detalle: 'Busco club o equipo para jugar' },
    { valor: 'dt', titulo: 'Director técnico', detalle: 'Armo y dirijo equipos' },
    { valor: 'club', titulo: 'Club', detalle: 'La cuenta la maneja su delegado' },
  ];

  protected form: FormGroup = this.fb.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8), validarPassword]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.maxLength(200)],
      tipo: ['', Validators.required],
    },
    // Validación cruzada: compara password con repetirPassword.
    { validators: passwordsIguales },
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
    datos.append('apellido', valores.apellido.trim());
    datos.append('email', valores.email.trim());
    datos.append('username', valores.username.trim());
    datos.append('password', valores.password);
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('descripcion', valores.descripcion.trim());
    datos.append('tipo', valores.tipo);
    datos.append('imagen', imagen);

    this.enviando.set(true);
    this.erroresServidor.set([]);

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
}
