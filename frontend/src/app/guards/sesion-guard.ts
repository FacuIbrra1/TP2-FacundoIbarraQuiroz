import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Autenticacion } from '../servicios/autenticacion';

// Como el authGuard del ejemplo de clase (Ej-clase-5): sin sesión, al login.
// "Solo se puede acceder a la aplicación estando registrado o logueado".
export const sesionGuard: CanActivateFn = () => {
  const autenticacion = inject(Autenticacion);
  const router = inject(Router);

  if (autenticacion.token()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
