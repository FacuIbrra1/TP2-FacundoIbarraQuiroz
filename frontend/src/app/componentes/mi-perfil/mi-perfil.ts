import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil {
  protected readonly autenticacion = inject(Autenticacion);

  protected nombreDelTipo(tipo: string | undefined): string {
    if (tipo === 'dt') {
      return 'Director técnico';
    }
    if (tipo === 'club') {
      return 'Club';
    }
    return 'Jugador';
  }
}
