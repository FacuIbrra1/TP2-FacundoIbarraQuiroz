import { HttpErrorResponse } from '@angular/common/http';

// En la compu (ng serve) usa el back local; publicado en Vercel, el back de Vercel.
export const API_URL =
  window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://potrero-libre-back.vercel.app';

// Nest responde los errores como { message: '...' }; si falla el ValidationPipe,
// como { message: ['...', '...'] }. Esto los deja siempre como una lista para mostrarlos.
export function mensajesDeError(error: HttpErrorResponse): string[] {
  if (error.status === 0) {
    return ['No se pudo conectar con el servidor. Probá de nuevo en un momento.'];
  }
  if (error.status === 413) {
    return ['La imagen no puede pesar más de 2 MB.'];
  }

  const mensaje = error.error?.message;
  if (Array.isArray(mensaje)) {
    return mensaje;
  }
  return [mensaje ?? 'Ocurrió un error inesperado. Probá de nuevo.'];
}
