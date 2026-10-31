import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador propio (como validarDominioEmpresa de la clase de formularios reactivos):
// la contraseña necesita al menos una mayúscula y un número.
// El largo mínimo lo controla Validators.minLength(8).
export function validarPassword(control: AbstractControl): ValidationErrors | null {
  const password = control.value as string;

  if (!password) {
    return null; // Si está vacía, el mensaje lo da Validators.required.
  }

  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneNumero = /\d/.test(password);

  if (!tieneMayuscula && !tieneNumero) {
    return { sinMayuscula: true, sinNumero: true };
  }
  if (!tieneMayuscula) {
    return { sinMayuscula: true };
  }
  if (!tieneNumero) {
    return { sinNumero: true };
  }
  return null;
}

// Validación cruzada: se aplica al formulario entero, porque compara dos campos.
export function passwordsIguales(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password')?.value;
  const repetirPassword = form.get('repetirPassword')?.value;

  if (repetirPassword && password !== repetirPassword) {
    return { passwordsDistintas: true };
  }
  return null;
}
