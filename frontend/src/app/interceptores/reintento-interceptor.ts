import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

// Si un GET falla porque el back no responde o tuvo un error (status 0 o 5xx),
// lo reintenta hasta 3 veces, esperando cada vez el doble: 1 s, 2 s y 4 s (retroceso exponencial).
export const reintentoInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo los GET: repetir un POST o un DELETE podría, por ejemplo, crear dos veces la misma publicación.
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, intento) => {
        // 4xx (400, 401, 404...): el pedido está mal y repetirlo da lo mismo. Se corta acá.
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        return timer(1000 * 2 ** (intento - 1)); // intento 1 → 1 s, 2 → 2 s, 3 → 4 s.
      },
    }),
  );
};