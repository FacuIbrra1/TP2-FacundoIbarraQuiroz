import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validación cruzada (como passwordsIguales): el lapso de las estadísticas no puede estar al revés.
// Las fechas del input date llegan como 'AAAA-MM-DD': con ese formato, comparar los textos es comparar las fechas.
export function rangoDeFechas(form: AbstractControl): ValidationErrors | null {
  const desde = form.get('desde')?.value;
  const hasta = form.get('hasta')?.value;

  if (desde && hasta && desde > hasta) {
    return { rangoInvertido: true };
  }
  return null; // Si falta alguna, lo avisa Validators.required.
}
