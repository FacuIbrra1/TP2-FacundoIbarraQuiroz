import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// Sprint 4: el marco del dashboard del administrador. Tiene las dos pestañas (usuarios y estadísticas)
// y un <router-outlet> donde se muestra la ruta hija elegida, como "productos" en el ejemplo de clase.
@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
