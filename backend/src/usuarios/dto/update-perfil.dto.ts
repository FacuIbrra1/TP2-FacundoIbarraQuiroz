import { IsDateString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// Editar mi perfil (PATCH /usuarios/mi-perfil). Corrección del Sprint 3.
// Llega como multipart/form-data (por la foto, que es opcional): todos los campos llegan como texto.
// Todos opcionales: se manda solo lo que cambia.
// No están el correo, el nombre de usuario, la contraseña, el tipo ni el perfil: no se cambian desde acá.
// Si alguien los manda, forbidNonWhitelisted responde 400 (así nadie se pone perfil "administrador").
export class UpdatePerfilDto {
  @IsOptional()
  @IsString({ message: 'El nombre tiene que ser un texto' })
  @Matches(/\S/, { message: 'El nombre es obligatorio' }) // Rechaza "" y "   ".
  nombre?: string;

  // Para jugador y DT, si viene, no puede quedar vacío (lo controla el servicio, porque depende del tipo).
  @IsOptional()
  @IsString({ message: 'El apellido tiene que ser un texto' })
  apellido?: string;

  @IsOptional()
  @IsString({ message: 'La descripción tiene que ser un texto' })
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'La fecha de nacimiento o de creación no es válida' })
  fechaNacimiento?: string;
}
