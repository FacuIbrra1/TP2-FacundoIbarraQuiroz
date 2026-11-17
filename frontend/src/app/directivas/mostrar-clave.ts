import { Directive, input, signal } from '@angular/core';

// Directiva propia 3 (Sprint 4): un botón que muestra u oculta lo escrito en un campo de contraseña.
//   <input #campoPassword type="password" ... />
//   <button [appMostrarClave]="campoPassword"></button>
// #campoPassword es una variable de plantilla (como #noProducto del ejemplo de guards): le pasa el
// input a la directiva. Se usa en el login y en los dos campos de contraseña del registro.
@Directive({
  selector: 'button[appMostrarClave]',
  host: {
    type: 'button', // Si no, al estar dentro de un <form>, el botón enviaría el formulario.
    class: 'boton-mostrar-clave',
    '(click)': 'alternar()',
    '[textContent]': "visible() ? 'Ocultar' : 'Mostrar'",
    '[attr.aria-label]': "visible() ? 'Ocultar la contraseña' : 'Mostrar la contraseña'",
  },
})
export class MostrarClave {
  readonly campo = input.required<HTMLInputElement>({ alias: 'appMostrarClave' });

  protected readonly visible = signal(false);

  // Cambia el tipo del input: con "text" se lee lo escrito; con "password", puntitos.
  protected alternar() {
    this.visible.set(!this.visible());
    this.campo().type = this.visible() ? 'text' : 'password';
  }
}
