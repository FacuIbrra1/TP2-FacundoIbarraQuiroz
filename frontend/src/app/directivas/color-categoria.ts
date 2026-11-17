import { computed, Directive, input } from '@angular/core';

// Directiva propia 2 (Sprint 4): pinta la etiqueta de la categoría con el color de esa categoría,
// así "Busco club", "Busco jugadores" y "Prueba" se distinguen de un vistazo en el listado.
//   <span [appColorCategoria]="publicacion.categoria">Busco club</span>
// host: [style.color] y [style.borderColor] son bindings de propiedades, como [class.activo] en una
// plantilla, pero hechos por la directiva sobre el elemento donde se la pone.
@Directive({
  selector: '[appColorCategoria]',
  host: {
    '[style.color]': 'color()',
    '[style.borderColor]': 'color()',
  },
})
export class ColorCategoria {
  // alias: la categoría se pasa en el mismo atributo de la directiva.
  readonly categoria = input.required<string>({ alias: 'appColorCategoria' });

  // computed (como en el TP-1): si la publicación se edita y cambia de categoría, el color cambia solo.
  // Los colores son los de la paleta de la app (styles.css).
  protected readonly color = computed(() => {
    const categoria = this.categoria();
    if (categoria === 'busco-club') {
      return 'var(--verde)';
    }
    if (categoria === 'busco-jugadores') {
      return 'var(--azul)';
    }
    if (categoria === 'prueba') {
      return 'var(--aviso)';
    }
    return 'var(--texto-suave)'; // General.
  });
}
