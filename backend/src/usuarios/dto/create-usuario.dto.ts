import {IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength} from 'class-validator';

// Los datos del registro (POST /auth/registro).
// Llega como multipart/form-data (por la imagen): TODOS los campos llegan como texto.
//
// No tiene `perfil`: si alguien lo manda para registrarse como administrador,
// forbidNonWhitelisted lo rechaza con un 400.
// Tampoco tiene `repetirPassword`: esa comparación es del formulario de Angular.

export class CreateUsuarioDto {
  @IsString({ message: 'El nombre tiene que ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El apellido tiene que ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  email: string;

  @IsString({ message: 'El nombre de usuario tiene que ser un texto' })
  @MinLength(3, {message: 'El nombre de usuario debe tener al menos 3 caracteres'})
  @MaxLength(20, {message: 'El nombre de usuario no puede superar los 20 caracteres'})
  username: string;

  // (?=.*[A-Z]) -> en algún lugar hay una mayúscula.
  // (?=.*\d)    -> en algún lugar hay un número.
  @IsString({ message: 'La contraseña tiene que ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  password: string;

  // strict: además del formato AAAA-MM-DD, controla que la fecha exista (rechaza 2001-02-30).
  @IsDateString(
    { strict: true },
    { message: 'La fecha de nacimiento no es válida' },
  )
  fechaNacimiento: string;

  @IsOptional()
  @IsString({ message: 'La descripción tiene que ser un texto' })
  @MaxLength(200, {
    message: 'La descripción no puede superar los 200 caracteres',
  })
  descripcion?: string;

  @IsIn(['jugador', 'dt', 'club'], {
    message: 'El tipo de cuenta debe ser jugador, dt o club',
  })
  tipo: string;
}
