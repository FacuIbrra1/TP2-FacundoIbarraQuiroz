import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicacionesService } from '../../servicios/publicaciones-service';
import { Publicacion } from '../../models/publicacion';
import { validarTextoNoVacio } from '../../validadores/publicacion';
import { mensajesDeError } from '../../api';

// El formulario para publicar. Se muestra arriba del listado y, cuando la publicación
// se crea, le avisa a la página con output() para que la cierre y recargue el listado.
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-formulario-publicacion',
  styleUrl: './formulario-publicacion.css',
  templateUrl: './formulario-publicacion.html',
})
export class FormularioPublicacion {
  private readonly fb = inject(FormBuilder);
  private readonly publicacionesService = inject(PublicacionesService);

  publicada = output<Publicacion>();
  cancelar = output<void>();

  // Las mismas categorías y los mismos límites que valida el back.
  protected readonly categorias = [
    { valor: 'general', nombre: 'General' },
    { valor: 'busco-club', nombre: 'Busco club' },
    { valor: 'busco-jugadores', nombre: 'Busco jugadores' },
    { valor: 'prueba', nombre: 'Prueba' },
  ];

  protected form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(100), validarTextoNoVacio]],
    mensaje: ['', [Validators.required, Validators.maxLength(1000), validarTextoNoVacio]],
    categoria: ['general', Validators.required],
  });

  // La imagen es opcional. Como en el registro, el campo file se maneja aparte.
  protected readonly imagen = signal<File | null>(null);
  protected readonly errorImagen = signal<string | null>(null);

  protected readonly enviando = signal(false);
  protected readonly erroresServidor = signal<string[]>([]);

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
      return; // Eligió y después canceló: queda sin imagen, que está permitido.
    }
    
    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen (JPG, PNG, WEBP…).');
    } else if (archivo.size > 2 * 1024 * 1024) {
      this.errorImagen.set('La imagen no puede pesar más de 2 MB.');
    } else {
      this.imagen.set(archivo);
    }
  }

  protected publicar() {
    if (this.form.invalid || this.errorImagen()) {
      this.form.markAllAsTouched(); // Muestra los mensajes de todos los campos.
      return;
    }

    // multipart/form-data, como el registro: los textos y la imagen viajan juntos.
    const valores = this.form.value;
    const datos = new FormData();
    datos.append('titulo', valores.titulo.trim());
    datos.append('mensaje', valores.mensaje.trim());
    datos.append('categoria', valores.categoria);

    const imagen = this.imagen();
    if (imagen) {
      datos.append('imagen', imagen);
    }

    this.enviando.set(true);
    this.erroresServidor.set([]);

    this.publicacionesService.crear(datos).subscribe({
      next: (publicacion) => {
        this.enviando.set(false);
        this.publicada.emit(publicacion);
      },
      error: (error) => {
        this.erroresServidor.set(mensajesDeError(error));
        this.enviando.set(false);
      },
    });
  }
}