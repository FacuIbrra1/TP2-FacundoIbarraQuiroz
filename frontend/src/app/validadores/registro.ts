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

// Validación cruzada (Sprint 4): el tipo "Administrador" solo existe para el perfil administrador.
// Solo puede pasar en el alta del dashboard: si se elige el tipo Administrador y después se cambia
// el perfil a Usuario.
export function tipoSegunPerfil(form: AbstractControl): ValidationErrors | null {
  const tipo = form.get('tipo')?.value;
  const perfil = form.get('perfil')?.value;

  if (tipo === 'administrador' && perfil !== 'administrador') {
    return { tipoSoloAdministrador: true };
  }
  return null;
}
