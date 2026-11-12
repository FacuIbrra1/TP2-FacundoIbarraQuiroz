import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
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
  ],
};
