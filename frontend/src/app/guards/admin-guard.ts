import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Autenticacion } from '../servicios/autenticacion';

// Sprint 4: como el roleGuard del ejemplo de clase (Ej-clase-5), pero con el perfil del enunciado:
// el dashboard es solo para administradores. Si no lo es, va a publicaciones.
// Va después del sesionGuard (sin sesión, primero al login). El back igual lo controla (403).
export const adminGuard: CanActivateFn = () => {
  const autenticacion = inject(Autenticacion);
  const router = inject(Router);

  if (autenticacion.esAdministrador()) {
    return true;
  }
  return router.createUrlTree(['/publicaciones']);
};
