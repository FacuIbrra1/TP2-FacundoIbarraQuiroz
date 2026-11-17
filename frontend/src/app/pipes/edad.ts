import { Pipe, PipeTransform } from '@angular/core';

// Pipe propio 3 (Sprint 4): los años que pasaron desde una fecha.
//   {{ usuario.fechaNacimiento | edad }}   → '25 años'
// Para un jugador o un DT es su edad; para un club, los años de la institución (su fecha de creación).
@Pipe({
  name: 'edad',
})
export class EdadPipe implements PipeTransform {
  transform(fecha: string | undefined): string {
    if (!fecha) {
      return '';
    }

    // La fecha se guarda a las 00:00 UTC: se lee con getUTC... (como el 'UTC' del DatePipe en Mi Perfil);
    // si no, en Argentina sería las 21:00 del día anterior.
    const nacimiento = new Date(fecha);
    const hoy = new Date();

    let anios = hoy.getFullYear() - nacimiento.getUTCFullYear();
    // Si este año todavía no llegó el día del cumpleaños (o del aniversario), es uno menos.
    const mesHoy = hoy.getMonth();
    const mesNacimiento = nacimiento.getUTCMonth();
    if (mesHoy < mesNacimiento || (mesHoy === mesNacimiento && hoy.getDate() < nacimiento.getUTCDate())) {
      anios--;
    }

    if (anios < 1) {
      return 'menos de un año';
    }
    return anios === 1 ? '1 año' : `${anios} años`;
  }
}
