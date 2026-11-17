import { Pipe, PipeTransform } from '@angular/core';

// Pipe propio 1 (Sprint 4): el tipo de cuenta como se lee en pantalla.
//   {{ usuario.tipo | tipoCuenta }}   'dt' → 'Director técnico'
// Antes era un método nombreDelTipo() repetido en la tarjeta y en Mi Perfil; como pipe se escribe una vez
// y se usa en cualquier plantilla (la tarjeta, Mi Perfil y el dashboard de usuarios).
@Pipe({
  name: 'tipoCuenta',
})
export class TipoCuentaPipe implements PipeTransform {
  transform(tipo: string | undefined): string {
    if (tipo === 'dt') {
      return 'Director técnico';
    }
    if (tipo === 'club') {
      return 'Club';
    }
    if (tipo === 'administrador') {
      return 'Administrador';
    }
    return 'Jugador';
  }
}
