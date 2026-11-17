import { IsIn } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';

// Sprint 4: el alta que hace un administrador (POST /usuarios).
// OmitType (de la misma familia que el PartialType del ejercicio-1): todos los campos del registro,
// con sus validaciones, MENOS el tipo. El tipo se vuelve a escribir acá porque suma una opción.
export class CreateUsuarioAdminDto extends OmitType(CreateUsuarioDto, ['tipo']) {
  // Los tres del registro y 'administrador'. Que el tipo 'administrador' vaya con el perfil
  // 'administrador' lo controla UsuariosService.crear().
  @IsIn(['jugador', 'dt', 'club', 'administrador'], {
    message: 'El tipo de cuenta debe ser jugador, dt, club o administrador',
  })
  tipo: string;

  // El perfil, que el administrador elige con dos radio buttons.
  @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser usuario o administrador' })
  perfil: string;
}
