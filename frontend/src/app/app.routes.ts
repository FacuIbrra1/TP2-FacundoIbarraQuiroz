import { Routes } from '@angular/router';
import { sesionGuard } from './guards/sesion-guard';
import { invitadoGuard } from './guards/invitado-guard';
import { adminGuard } from './guards/admin-guard';

// Sprint 3: la app arranca en la pantalla de cargando, y las pantallas de la red social
// piden sesión (sesionGuard). El login y el registro, al revés (invitadoGuard).
// Sprint 4: el dashboard pide sesión y, además, ser administrador (adminGuard).
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
    // Sprint 4: el dashboard del administrador. Como "productos" en el ejemplo de clase: un componente
    // padre (las pestañas y un <router-outlet>) con rutas hijas. Los guards del padre cuidan a las hijas.
    path: 'dashboard',
    loadComponent: () => import('./componentes/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [sesionGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./componentes/dashboard-usuarios/dashboard-usuarios').then((m) => m.DashboardUsuarios),
      },
      {
        // Chart.js solo se descarga al entrar acá (loadComponent): el resto de la app no lo carga.
        path: 'estadisticas',
        loadComponent: () =>
          import('./componentes/dashboard-estadisticas/dashboard-estadisticas').then(
            (m) => m.DashboardEstadisticas,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
