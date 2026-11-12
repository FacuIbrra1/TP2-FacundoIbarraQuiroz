import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Autenticacion } from '../servicios/autenticacion';

// Si un pedido devuelve 401 (el token venció o no sirve), cierra la sesión y lleva al login
// para sacar un token nuevo (lo pide el enunciado).
// catchError es de RxJS, como retry y timer del reintentoInterceptor: se mete en la respuesta
// y, si hubo un error, hace algo antes de dejarlo seguir.
export const sesionInterceptor: HttpInterceptorFn = (req, next) => {
  const autenticacion = inject(Autenticacion);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Solo si había sesión: en el login, un 401 es "usuario o contraseña incorrectos"
      // y lo muestra el formulario.
      if (error.status === 401 && autenticacion.token()) {
        autenticacion.cerrarSesion();
        autenticacion.sesionVencida.set(true);
        router.navigate(['/login']);
      }
      // El error sigue su camino: el componente que hizo el pedido también se entera.
      return throwError(() => error);
    }),
  );
};
