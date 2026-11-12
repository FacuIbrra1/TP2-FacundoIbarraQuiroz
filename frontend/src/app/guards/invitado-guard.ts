import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Autenticacion } from '../servicios/autenticacion';

// Al revés que el sesionGuard: el login y el registro son para quien no tiene sesión.
// Si ya la tiene, va directo a publicaciones.
export const invitadoGuard: CanActivateFn = () => {
  const autenticacion = inject(Autenticacion);
  const router = inject(Router);

  if (autenticacion.token()) {
    return router.createUrlTree(['/publicaciones']);
  }
  return true;
};
