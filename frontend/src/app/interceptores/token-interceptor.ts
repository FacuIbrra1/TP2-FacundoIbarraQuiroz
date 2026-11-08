import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '../api';
import { Autenticacion } from '../servicios/autenticacion';

// Agrega el token (Authorization: Bearer ...) a cada pedido que va al back.
// Así los servicios no tienen que acordarse de mandarlo: lo pone el interceptor.
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Autenticacion).token();

  // Sin sesión, o un pedido a otro sitio (no al back): sale como está.
  if (!token || !req.url.startsWith(API_URL)) {
    return next(req);
  }

  // El pedido no se puede modificar: se hace una copia con el header agregado.
  const reqConToken = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(reqConToken);
};