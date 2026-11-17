import { Directive } from '@angular/core';

// La imagen que se muestra cuando una foto de perfil no carga (está en public/).
const IMAGEN_RESPALDO = 'sin-foto.svg';

// Directiva propia 1 (Sprint 4): si una foto de perfil no se puede cargar (la URL se rompió, Cloudinary
// no responde, no hay internet), en lugar del ícono de imagen rota muestra una silueta.
//   <img [src]="usuario.imagenUrl" appImagenRespaldo />
// host: escucha el evento (error) de la imagen, como un (click) en la plantilla, pero desde la directiva:
// así sirve igual para todas las fotos de la app (encabezado, tarjetas, comentarios, Mi Perfil y dashboard).
@Directive({
  selector: 'img[appImagenRespaldo]',
  host: {
    '(error)': 'usarRespaldo($event)',
  },
})
export class ImagenRespaldo {
  protected usarRespaldo(evento: Event) {
    // Como el (change) del campo file del registro: el elemento llega en evento.target.
    const imagen = evento.target as HTMLImageElement;

    // Si la de respaldo también fallara, no se vuelve a cambiar: si no, quedaría probando para siempre.
    if (!imagen.src.endsWith(IMAGEN_RESPALDO)) {
      imagen.src = IMAGEN_RESPALDO;
    }
  }
}
