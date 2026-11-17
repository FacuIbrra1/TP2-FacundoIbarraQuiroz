import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { tokenInterceptor } from './interceptores/token-interceptor';
import { reintentoInterceptor } from './interceptores/reintento-interceptor';
import { sesionInterceptor } from './interceptores/sesion-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Para hablar con el back de Nest. Cada pedido pasa por los interceptores, en este orden:
    // token → sesión (401 → login) → reintento (los GET que fallan por el servidor).
    provideHttpClient(withInterceptors([tokenInterceptor, sesionInterceptor, reintentoInterceptor])),
    // Sprint 4 (PWA), como en el TP-1: el service worker guarda los archivos de la app en el navegador,
    // así se puede instalar y abre más rápido. Solo en la versión publicada (con ng serve se desactiva,
    // si no, guardaría versiones viejas mientras se programa). Se registra cuando la app ya cargó.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
