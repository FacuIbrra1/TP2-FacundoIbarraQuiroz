import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validación cruzada (como passwordsIguales): el apellido depende del tipo de cuenta.
// Jugador y DT son personas y lo necesitan; un club no tiene apellido.
export function apellidoSegunTipo(form: AbstractControl): ValidationErrors | null {
  const tipo = form.get('tipo')?.value;
  const apellido = form.get('apellido')?.value as string;

  if (tipo !== 'club' && !apellido?.trim()) {
    return { apellidoObligatorio: true };
  }
  return null;
}