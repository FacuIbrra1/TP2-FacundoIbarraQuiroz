import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { tokenInterceptor } from './interceptores/token-interceptor';
import { reintentoInterceptor } from './interceptores/reintento-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Para hablar con el back de Nest. Cada pedido pasa por los interceptores, en este orden.
    provideHttpClient(withInterceptors([tokenInterceptor, reintentoInterceptor])),
  ],
};
