import { Pipe, PipeTransform } from '@angular/core';

// Pipe propio 2 (Sprint 4): cuánto hace que se publicó o se comentó algo,
//   {{ publicacion.fecha | haceTiempo }} -> 'recién', 'hace 5 minutos', 'hace 2 horas', 'hace 3 días'...
// La fecha exacta sigue a mano: va en el title (aparece al dejar el mouse encima), con el DatePipe.
// Es un pipe puro (como el del ejemplo de clase): se calcula cuando la pantalla se dibuja con esa fecha,
// no se actualiza solo con el paso del tiempo.
@Pipe({
  name: 'haceTiempo',
})
export class HaceTiempoPipe implements PipeTransform {
  transform(fecha: string): string {
    const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);

    if (segundos < 60) {
      return 'recién';
    }
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) {
      return this.hace(minutos, 'minuto', 'minutos');
    }
    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      return this.hace(horas, 'hora', 'horas');
    }
    const dias = Math.floor(horas / 24);
    if (dias < 30) {
      return this.hace(dias, 'día', 'días');
    }
    const meses = Math.floor(dias / 30);
    if (meses < 12) {
      return this.hace(meses, 'mes', 'meses');
    }
    return this.hace(Math.floor(dias / 365), 'año', 'años');
  }

  // "hace 1 hora" y "hace 2 horas": en singular solo cuando es 1.
  private hace(cantidad: number, singular: string, plural: string): string {
    return `hace ${cantidad} ${cantidad === 1 ? singular : plural}`;
  }
}
