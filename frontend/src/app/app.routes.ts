import { Routes } from '@angular/router';
import { sesionGuard } from './guards/sesion-guard';
import { invitadoGuard } from './guards/invitado-guard';

// Sprint 3: la app arranca en la pantalla de cargando, y las pantallas de la red social
// piden sesión (sesionGuard). El login y el registro, al revés (invitadoGuard).
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/cargando/cargando').then((m) => m.Cargando),
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then((m) => m.Login),
    canActivate: [invitadoGuard],
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro').then((m) => m.Registro),
    canActivate: [invitadoGuard],
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./componentes/publicaciones/publicaciones').then((m) => m.Publicaciones),
    canActivate: [sesionGuard],
  },
  {
    path: 'publicacion/:id',
    loadComponent: () =>
      import('./componentes/pagina-publicacion/pagina-publicacion').then((m) => m.PaginaPublicacion),
    canActivate: [sesionGuard],
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
    canActivate: [sesionGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
