import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador propio (como validarDominioEmpresa de la clase de formularios reactivos).
// Validators.email acepta "prueba@m" (le alcanza con algo después del @), pero el back
// (@IsEmail) pide un dominio completo, con punto y terminación: "prueba@mail.com".
export function validarDominioEmail(control: AbstractControl): ValidationErrors | null {
  const email = control.value as string;

  if (!email || !email.includes('@')) {
    return null; // Vacío: lo avisa Validators.required. Sin @: lo avisa Validators.email.
  }

  const dominio = email.split('@')[1]; // "prueba@mail.com" → "mail.com"
  const partes = dominio.split('.'); // "mail.com" → ["mail", "com"]
  const terminacion = partes[partes.length - 1]; // "com"

  // "m" no tiene punto, "mail." termina en punto y "mail.c" tiene una terminación de una sola letra.
  if (partes.length < 2 || partes.includes('') || terminacion.length < 2) {
    return { dominioIncompleto: true };
  }
  return null;
}