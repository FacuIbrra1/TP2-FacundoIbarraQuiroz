import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';

@Component({
  imports: [RouterLink],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})
export class Publicaciones {
  protected readonly autenticacion = inject(Autenticacion);

  // Las categorías de Potrero Libre. En el Sprint 2 filtran el listado.
  protected readonly categorias = ['General', 'Busco club', 'Busco jugadores', 'Prueba'];
}
