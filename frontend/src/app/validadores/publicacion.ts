import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador propio (como validarDominioEmail): Validators.required acepta un texto hecho solo
// de espacios ("   "), pero el back lo rechaza. Así el usuario se entera antes de publicar.
export function validarTextoNoVacio(control: AbstractControl): ValidationErrors | null {
  const texto = control.value as string;

  if (texto && texto.trim() === '') {
    return { soloEspacios: true };
  }
  return null; // Si está vacío del todo, lo avisa Validators.required.
}